ALTER TABLE "User"
ADD COLUMN "verificationObjectKey" TEXT;

ALTER TABLE "Payment"
ADD COLUMN "proofObjectKey" TEXT;

ALTER TABLE "Order"
ADD COLUMN "checkoutToken" TEXT;

UPDATE "Order"
SET "checkoutToken" = "id"
WHERE "checkoutToken" IS NULL;

ALTER TABLE "Order"
ALTER COLUMN "checkoutToken" SET NOT NULL;

CREATE UNIQUE INDEX "User_verificationObjectKey_key"
ON "User"("verificationObjectKey");

CREATE UNIQUE INDEX "Payment_proofObjectKey_key"
ON "Payment"("proofObjectKey");

CREATE UNIQUE INDEX "Order_buyerId_checkoutToken_storeId_key"
ON "Order"("buyerId", "checkoutToken", "storeId");

CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitBucket_expiresAt_idx"
ON "RateLimitBucket"("expiresAt");

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key"
ON "PasswordResetToken"("tokenHash");

CREATE INDEX "PasswordResetToken_userId_idx"
ON "PasswordResetToken"("userId");

CREATE INDEX "PasswordResetToken_expiresAt_idx"
ON "PasswordResetToken"("expiresAt");

ALTER TABLE "PasswordResetToken"
ADD CONSTRAINT "PasswordResetToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
