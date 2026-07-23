"use server";

import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { passwordResetLimiter } from "@/lib/rate-limit";
import { emailSchema, passwordSchema } from "@/lib/validators/auth";

export type ResetRequestState = {
  error?: string;
  success?: boolean;
};

export type ResetPasswordState = ResetRequestState;

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Format email tidak valid" };
  if (!(await passwordResetLimiter.check(parsed.data))) {
    return { error: "Terlalu banyak permintaan. Coba lagi nanti." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data },
    select: { id: true, email: true },
  });
  if (!user) return { success: true };

  const token = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(Date.now() + 60 * 60_000),
      },
    }),
  ]);

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const resetUrl = new URL("/reset-password", baseUrl);
  resetUrl.searchParams.set("token", token);
  await sendPasswordResetEmail(user.email, resetUrl.toString());
  return { success: true };
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (!token || password !== confirmPassword || !passwordSchema.safeParse(password).success) {
    return { error: "Token atau password tidak valid" };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    return { error: "Tautan reset tidak valid atau sudah kedaluwarsa" };
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (consumed.count !== 1) throw new Error("Reset token already consumed");

    await tx.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await tx.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        actorId: record.userId,
        action: "PASSWORD_RESET",
        targetEntity: "User",
        targetId: record.userId,
      },
    });
  });

  return { success: true };
}
