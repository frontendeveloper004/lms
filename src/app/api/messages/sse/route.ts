import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { setUserOnline, setUserOffline, createRedisClient } from "@/lib/redis-pubsub";
import { registerConnection, notifyInMemory } from "@/lib/sse-manager";

// Heartbeat — 25 soniyada bir ping
const HEARTBEAT_MS = 25_000;
// Upstash fallback polling — faqat in-memory miss bo'lganda
const POLL_MS = 300;
const BATCH_SIZE = 20;

/**
 * GET /api/messages/sse
 *
 * Dual-layer real-time arxitektura:
 *
 *  Layer 1 — In-memory (0ms):
 *    notifyUser() → sse-manager Map → to'g'ridan-to'g'ri SSE controller
 *
 *  Layer 2 — Upstash Redis fallback (300ms polling):
 *    notifyUser() → Redis RPUSH → polling → SSE
 *    (multi-tab, boshqa server instance, yoki in-memory miss uchun)
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.userId;
  const queueKey = `sse:queue:${userId}`;

  // Online belgilash
  await Promise.all([
    prisma.userOnlineStatus.upsert({
      where: { userId },
      update: { isOnline: true, lastSeen: new Date() },
      create: { userId, isOnline: true },
    }).catch(() => {}),
    setUserOnline(userId).catch(() => {}),
  ]);

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: object): boolean => {
        if (closed) return false;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
          return true;
        } catch {
          closed = true;
          return false;
        }
      };

      // Layer 1: in-memory ga ro'yxatdan o'tish
      const unregister = registerConnection(userId, controller);

      // Dastlabki ulanish eventi
      send({ type: "connected", userId });

      const redis = createRedisClient();

      // Heartbeat
      const heartbeatTimer = setInterval(() => {
        if (closed) { clearInterval(heartbeatTimer); return; }
        send({ type: "ping" });
        setUserOnline(userId).catch(() => {});
      }, HEARTBEAT_MS);

      // Layer 2: Upstash fallback polling (300ms)
      // In-memory orqali yetmagan xabarlarni olish uchun
      const poll = async () => {
        if (closed) return;
        try {
          const items = await redis.lpop(queueKey, BATCH_SIZE) as string[] | null;
          if (items && items.length > 0) {
            for (const item of items) {
              try {
                const parsed = typeof item === "string" ? JSON.parse(item) : item;
                send(parsed);
              } catch { /* parse xatosi */ }
            }
          }
        } catch { /* Redis xatosi */ }

        if (!closed) setTimeout(poll, POLL_MS);
      };
      setTimeout(poll, POLL_MS);

      // Disconnect
      req.signal.addEventListener("abort", async () => {
        closed = true;
        clearInterval(heartbeatTimer);
        unregister();

        await Promise.all([
          prisma.userOnlineStatus.upsert({
            where: { userId },
            update: { isOnline: false, lastSeen: new Date() },
            create: { userId, isOnline: false },
          }).catch(() => {}),
          setUserOffline(userId).catch(() => {}),
        ]);

        try { controller.close(); } catch { /* allaqachon yopilgan */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * notifyUser — barcha route'lardan chaqiriladi.
 *
 * 1. In-memory orqali darhol yuboradi (0ms) — agar user ulanib tursa
 * 2. Upstash Redis ga ham yozadi — faqat receiver uchun fallback
 *    (sender in-memory orqali oladi, Upstash duplicate bo'lmaydi)
 */
export async function notifyUser(
  userId: string,
  data: object,
  opts?: { skipRedis?: boolean }
): Promise<void> {
  // Layer 1: in-memory — 0ms
  notifyInMemory(userId, data);

  // Layer 2: Upstash fallback — skipRedis bo'lmasa yozamiz
  if (opts?.skipRedis) return;

  const redis = createRedisClient();
  const queueKey = `sse:queue:${userId}`;
  try {
    await redis.rpush(queueKey, JSON.stringify(data));
    await redis.expire(queueKey, 300); // 5 daqiqa TTL
  } catch (err) {
    console.error(`[SSE] Redis fallback xatosi (userId=${userId}):`, err);
  }
}
