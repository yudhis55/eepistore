"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validators/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export type ResetRequestState = {
  error?: string;
  success?: boolean;
};

export async function requestPasswordResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = formData.get("email");
  const parsed = emailSchema.safeParse(email);

  if (!parsed.success) {
    return { error: "Format email tidak valid" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Store token in a separate field (we'll add it to schema if needed)
      // For now, use a notification record as a simple token store
    },
  });

  // Simple token storage via notification payload
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "PASSWORD_RESET",
      title: "Reset Password",
      payload: { token, expires: expires.toISOString() },
      isRead: false,
    },
  });

  const resetUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  return { success: true };
}
