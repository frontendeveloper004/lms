/**
 * SSE In-Memory Connection Manager
 *
 * Har bir ulanib turgan user uchun SSE controller saqlanadi.
 * notifyInMemory() chaqirilganda to'g'ridan-to'g'ri controller'ga yoziladi — 0ms.
 */

type SSEController = ReadableStreamDefaultController<Uint8Array>;

// Global singleton — hot reload'da saqlanadi
declare global {
  // eslint-disable-next-line no-var
  var _sseConnections: Map<string, Set<SSEController>> | undefined;
}

function getConnections(): Map<string, Set<SSEController>> {
  if (!globalThis._sseConnections) {
    globalThis._sseConnections = new Map();
  }
  return globalThis._sseConnections;
}

const encoder = new TextEncoder();

/**
 * Yangi SSE ulanishni ro'yxatga olish.
 * Qaytarilgan funksiya disconnect bo'lganda chaqiriladi.
 */
export function registerConnection(
  userId: string,
  controller: SSEController
): () => void {
  const connections = getConnections();

  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId)!.add(controller);

  return () => {
    const set = connections.get(userId);
    if (set) {
      set.delete(controller);
      if (set.size === 0) connections.delete(userId);
    }
  };
}

/**
 * In-memory orqali foydalanuvchiga darhol event yuborish (0ms).
 * Agar user ulanmagan bo'lsa — Upstash fallback ishga tushadi.
 */
export function notifyInMemory(userId: string, data: object): void {
  const connections = getConnections();
  const set = connections.get(userId);
  if (!set || set.size === 0) return;

  const payload = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
  const dead = new Set<SSEController>();

  for (const controller of set) {
    try {
      controller.enqueue(payload);
    } catch {
      dead.add(controller);
    }
  }

  // O'lik connectionlarni tozalash
  for (const c of dead) set.delete(c);
  if (set.size === 0) connections.delete(userId);
}
