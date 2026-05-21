import { Redis } from "@upstash/redis";

// ─── Singleton Redis client ───────────────────────────────────────────────────
// Har safar yangi instance yaratish o'rniga bitta global instance ishlatamiz.
// Bu Upstash HTTP connection overhead'ini kamaytiradi.

declare global {
  // eslint-disable-next-line no-var
  var _redisClient: Redis | undefined;
}

function getRedisClient(): Redis {
  if (globalThis._redisClient) return globalThis._redisClient;

  const client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    // Retry sozlamalari — transient xatolarda qayta urinish
    retry: {
      retries: 3,
      backoff: (attempt) => Math.min(attempt * 200, 1000),
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis._redisClient = client;
  }

  return client;
}

// Tashqaridan ishlatish uchun — createRedisClient() backward compat saqlanadi
export function createRedisClient(): Redis {
  return getRedisClient();
}

// Singleton export — to'g'ridan-to'g'ri ishlatish uchun
export const redis = getRedisClient();

// Channel nomi — har bir user o'z channel'iga subscribe bo'ladi
export function getUserChannel(userId: string): string {
  return `chat:user:${userId}`;
}

// Online status key
export function getOnlineKey(userId: string): string {
  return `online:${userId}`;
}

// Xabarni Redis orqali publish qilish
export async function publishToUser(userId: string, data: object): Promise<void> {
  const channel = getUserChannel(userId);
  await redis.publish(channel, JSON.stringify(data));
}

// Foydalanuvchini online deb belgilash (TTL: 35 soniya — heartbeat bilan yangilanadi)
export async function setUserOnline(userId: string): Promise<void> {
  await redis.set(getOnlineKey(userId), "1", { ex: 35 });
}

// Foydalanuvchini offline deb belgilash
export async function setUserOffline(userId: string): Promise<void> {
  await redis.del(getOnlineKey(userId));
}

// Foydalanuvchi online ekanligini tekshirish
export async function isUserOnline(userId: string): Promise<boolean> {
  const val = await redis.get(getOnlineKey(userId));
  return val === "1";
}

// Bir vaqtda bir nechta userning online statusini tekshirish (batch)
export async function areUsersOnline(userIds: string[]): Promise<Map<string, boolean>> {
  if (userIds.length === 0) return new Map();

  const keys = userIds.map(getOnlineKey);
  const values = await redis.mget<(string | null)[]>(...keys);

  const result = new Map<string, boolean>();
  userIds.forEach((id, i) => {
    result.set(id, values[i] === "1");
  });
  return result;
}
