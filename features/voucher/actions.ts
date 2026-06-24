"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type VoucherActionState = {
  error?: string;
  success?: boolean;
};

const voucherSchema = z.object({
  code: z
    .string()
    .min(3, "Kode voucher minimal 3 karakter")
    .max(50, "Kode voucher maksimal 50 karakter")
    .regex(/^[A-Z0-9_-]+$/, "Kode hanya huruf besar, angka, dash, underscore"),
  description: z.string().max(500).optional().or(z.literal("")),
  discountType: z.enum(["PERCENTAGE", "NOMINAL"]),
  value: z.number().min(0, "Nilai diskon tidak boleh negatif"),
  minPurchase: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).optional(),
  quota: z.number().int().min(0).default(0),
  validFrom: z.string().min(1, "Tanggal mulai wajib diisi"),
  validUntil: z.string().min(1, "Tanggal berakhir wajib diisi"),
  isActive: z.boolean().default(true),
});

export async function createVoucherAction(
  _prev: VoucherActionState,
  formData: FormData,
): Promise<VoucherActionState> {
  await requireRole("ADMIN");

  const parsed = voucherSchema.safeParse({
    code: String(formData.get("code") ?? "").toUpperCase(),
    description: formData.get("description") || undefined,
    discountType: formData.get("discountType"),
    value: Number(formData.get("value")),
    minPurchase: Number(formData.get("minPurchase")) || 0,
    maxDiscount: formData.get("maxDiscount") ? Number(formData.get("maxDiscount")) : undefined,
    quota: Number(formData.get("quota")) || 0,
    validFrom: formData.get("validFrom"),
    validUntil: formData.get("validUntil"),
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  try {
    await prisma.voucher.create({
      data: {
        code: data.code,
        description: data.description || null,
        discountType: data.discountType,
        value: data.value,
        minPurchase: data.minPurchase,
        maxDiscount: data.maxDiscount ?? null,
        quota: data.quota,
        validFrom: new Date(data.validFrom),
        validUntil: new Date(data.validUntil),
        isActive: data.isActive,
      },
    });
  } catch {
    return { error: "Kode voucher sudah ada" };
  }

  revalidatePath("/admin/vouchers");
  return { success: true };
}

export async function deleteVoucherAction(id: string) {
  await requireRole("ADMIN");
  await prisma.voucher.delete({ where: { id } });
  revalidatePath("/admin/vouchers");
}

export async function toggleVoucherAction(id: string) {
  await requireRole("ADMIN");
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (voucher) {
    await prisma.voucher.update({
      where: { id },
      data: { isActive: !voucher.isActive },
    });
  }
  revalidatePath("/admin/vouchers");
}

// ─── Validate voucher for checkout (public) ───

export async function validateVoucherAction(code: string, totalAmount: number) {
  const voucher = await prisma.voucher.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!voucher) return { valid: false, error: "Kode voucher tidak ditemukan" };
  if (!voucher.isActive) return { valid: false, error: "Voucher tidak aktif" };

  const now = new Date();
  if (now < voucher.validFrom) return { valid: false, error: "Voucher belum berlaku" };
  if (now > voucher.validUntil) return { valid: false, error: "Voucher sudah kedaluwarsa" };

  if (voucher.usedCount >= voucher.quota && voucher.quota > 0) {
    return { valid: false, error: "Kuota voucher habis" };
  }

  if (totalAmount < Number(voucher.minPurchase)) {
    return {
      valid: false,
      error: `Minimum pembelian ${Number(voucher.minPurchase).toLocaleString("id-ID")}`,
    };
  }

  let discount = 0;
  if (voucher.discountType === "PERCENTAGE") {
    discount = (totalAmount * Number(voucher.value)) / 100;
    if (voucher.maxDiscount) {
      discount = Math.min(discount, Number(voucher.maxDiscount));
    }
  } else {
    discount = Number(voucher.value);
  }

  discount = Math.min(discount, totalAmount);

  return {
    valid: true,
    discount,
    voucherId: voucher.id,
    code: voucher.code,
  };
}

export async function getAllVouchers() {
  await requireRole("ADMIN");
  return prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
}
