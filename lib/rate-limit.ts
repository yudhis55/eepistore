/**
 * Simple in-memory rate limiter.
 * For production with multiple instances, replace with Redis-backed implementation.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60000, max: 10 });
 *   if (!limiter.check(identifier)) { return 429 }
 */

type RateLimitConfig = {
  windowMs: number;
  max: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Cleanup expired buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) {
      buckets.delete(key);
    }
  }
}, 60000).unref();

export function createRateLimiter(config: RateLimitConfig) {
  return {
    check(identifier: string): boolean {
      const now = Date.now();
      const key = `${identifier}`;
      const bucket = buckets.get(key);

      if (!bucket || bucket.resetAt < now) {
        buckets.set(key, { count: 1, resetAt: now + config.windowMs });
        return true;
      }

      if (bucket.count >= config.max) {
        return false;
      }

      bucket.count++;
      return true;
    },
    remaining(identifier: string): number {
      const bucket = buckets.get(identifier);
      if (!bucket || bucket.resetAt < Date.now()) return config.max;
      return Math.max(0, config.max - bucket.count);
    },
  };
}

// Pre-configured limiters for sensitive endpoints
export const loginLimiter = createRateLimiter({ windowMs: 60000, max: 5 });
export const registerLimiter = createRateLimiter({ windowMs: 60000, max: 3 });
export const uploadLimiter = createRateLimiter({ windowMs: 60000, max: 20 });
export const checkoutLimiter = createRateLimiter({ windowMs: 60000, max: 5 });
