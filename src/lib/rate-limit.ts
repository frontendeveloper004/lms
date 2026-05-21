import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Single Redis instance — reused across all limiters
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Auth endpoints — login, register
 * 10 requests per 60 seconds per IP
 * Brute-force himoyasi
 */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "rl:auth",
});

/**
 * Upload endpoints — avatar, cover, lesson attachment
 * 20 uploads per 60 seconds per user
 */
export const uploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
  prefix: "rl:upload",
});

/**
 * General API endpoints
 * 100 requests per 60 seconds per IP
 */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
  prefix: "rl:api",
});

/**
 * Piston code execution — qimmat resurs
 * 30 executions per 60 seconds per user
 */
export const pistonLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
  prefix: "rl:piston",
});

/**
 * Messaging — spam himoyasi
 * 60 messages per 60 seconds per user
 */
export const messageLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
  prefix: "rl:message",
});
