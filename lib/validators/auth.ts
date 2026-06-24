import { z } from "zod";

export const emailSchema = z
  .string()
  .email("Format email tidak valid")
  .max(255, "Email terlalu panjang");

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .max(100, "Password terlalu panjang")
  .regex(/[A-Za-z]/, "Password harus mengandung huruf")
  .regex(/[0-9]/, "Password harus mengandung angka");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(100),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
