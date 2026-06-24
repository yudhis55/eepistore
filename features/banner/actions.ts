"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type BannerActionState = {
  error?: string;
  success?: boolean;
};

const bannerSchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter").max(200),
  imageUrl: z.string().url("URL gambar wajib diisi"),
  linkUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function createBannerAction(
  _prev: BannerActionState,
  formData: FormData,
): Promise<BannerActionState> {
  await requireRole("ADMIN");

  const parsed = bannerSchema.safeParse({
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    linkUrl: formData.get("linkUrl") || undefined,
    description: formData.get("description") || undefined,
    position: Number(formData.get("position")) || 0,
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  await prisma.banner.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl || null,
      description: data.description || null,
      position: data.position,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBannerAction(id: string) {
  await requireRole("ADMIN");
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function toggleBannerAction(id: string) {
  await requireRole("ADMIN");
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (banner) {
    await prisma.banner.update({
      where: { id },
      data: { isActive: !banner.isActive },
    });
  }
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function getActiveBanners() {
  const now = new Date();
  return prisma.banner.findMany({
    where: {
      isActive: true,
      AND: [
        {
          OR: [{ validFrom: null }, { validFrom: { lte: now } }],
        },
        {
          OR: [{ validUntil: null }, { validUntil: { gte: now } }],
        },
      ],
    },
    orderBy: { position: "asc" },
  });
}

export async function getAllBanners() {
  await requireRole("ADMIN");
  return prisma.banner.findMany({ orderBy: { position: "asc" } });
}
