import { prisma } from "@/lib/prisma";

type RateLimitConfig = {
  namespace: string;
  windowMs: number;
  max: number;
};

type CounterRow = {
  count: number;
};

export function createRateLimiter(config: RateLimitConfig) {
  return {
    async check(identifier: string): Promise<boolean> {
      const now = new Date();
      const resetAt = new Date(now.getTime() + config.windowMs);
      const key = `${config.namespace}:${identifier.trim().toLowerCase()}`;

      const rows = await prisma.$queryRaw<CounterRow[]>`
        INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt", "updatedAt")
        VALUES (${key}, 1, ${resetAt}, ${now})
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE
            WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN 1
            ELSE "RateLimitBucket"."count" + 1
          END,
          "expiresAt" = CASE
            WHEN "RateLimitBucket"."expiresAt" <= ${now} THEN ${resetAt}
            ELSE "RateLimitBucket"."expiresAt"
          END,
          "updatedAt" = ${now}
        RETURNING "count"
      `;

      return (rows[0]?.count ?? config.max + 1) <= config.max;
    },
  };
}

export const loginLimiter = createRateLimiter({
  namespace: "login",
  windowMs: 60_000,
  max: 5,
});
export const registerLimiter = createRateLimiter({
  namespace: "register",
  windowMs: 60_000,
  max: 3,
});
export const uploadLimiter = createRateLimiter({
  namespace: "upload",
  windowMs: 60_000,
  max: 20,
});
export const checkoutLimiter = createRateLimiter({
  namespace: "checkout",
  windowMs: 60_000,
  max: 5,
});
export const passwordResetLimiter = createRateLimiter({
  namespace: "password-reset",
  windowMs: 15 * 60_000,
  max: 3,
});
