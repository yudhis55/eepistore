"use server";

import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth";
import { registerLimiter } from "@/lib/rate-limit";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const emailRaw = String(formData.get("email") ?? "");

  if (!registerLimiter.check(emailRaw || "anon")) {
    return { error: "Terlalu banyak percobaan registrasi. Coba lagi nanti." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar" };
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "BUYER",
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registrasi berhasil tapi gagal login otomatis" };
    }
    throw error;
  }

  return { success: true };
}
