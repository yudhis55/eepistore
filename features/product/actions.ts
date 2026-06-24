"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/rbac";
import { productSchema } from "@/lib/validators/catalog";
import { revalidatePath } from "next/cache";

export type ProductActionState = {
  error?: string;
  success?: boolean;
};

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await requireAuth();

  const store = await prisma.storeProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!store || store.status !== "APPROVED") {
    return { error: "Toko Anda belum disetujui" };
  }

  const imagesRaw = formData.get("images") as string | null;
  const images = imagesRaw ? (JSON.parse(imagesRaw) as string[]) : [];

  const variantsRaw = formData.get("variants") as string | null;
  const variants = variantsRaw ? JSON.parse(variantsRaw) : [];

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    condition: formData.get("condition"),
    status: formData.get("status"),
    categoryId: formData.get("categoryId") || undefined,
    images,
    variants,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  await prisma.product.create({
    data: {
      storeId: store.id,
      categoryId: data.categoryId || null,
      name: data.name,
      description: data.description || null,
      price: data.price,
      stock: data.stock,
      condition: data.condition,
      status: data.status,
      images: {
        create: data.images.map((url, index) => ({
          imageUrl: url,
          position: index,
        })),
      },
      variants:
        data.variants && data.variants.length > 0
          ? {
              create: data.variants.map((v) => ({
                name: v.name,
                value: v.value,
                priceAdjustment: v.priceAdjustment,
                stock: v.stock,
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateProductAction(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const session = await requireAuth();

  const store = await prisma.storeProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!store) return { error: "Toko tidak ditemukan" };

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id },
  });

  if (!product) return { error: "Produk tidak ditemukan" };

  const imagesRaw = formData.get("images") as string | null;
  const images = imagesRaw ? (JSON.parse(imagesRaw) as string[]) : [];

  const variantsRaw = formData.get("variants") as string | null;
  const variants = variantsRaw ? JSON.parse(variantsRaw) : [];

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    condition: formData.get("condition"),
    status: formData.get("status"),
    categoryId: formData.get("categoryId") || undefined,
    images,
    variants,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const data = parsed.data;

  // Delete old images and variants, then recreate
  await prisma.productImage.deleteMany({ where: { productId } });
  await prisma.productVariant.deleteMany({ where: { productId } });

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      description: data.description || null,
      price: data.price,
      stock: data.stock,
      condition: data.condition,
      status: data.status,
      categoryId: data.categoryId || null,
      images: {
        create: data.images.map((url, index) => ({
          imageUrl: url,
          position: index,
        })),
      },
      variants:
        data.variants && data.variants.length > 0
          ? {
              create: data.variants.map((v) => ({
                name: v.name,
                value: v.value,
                priceAdjustment: v.priceAdjustment,
                stock: v.stock,
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function deleteProductAction(productId: string) {
  const session = await requireAuth();

  const store = await prisma.storeProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!store) throw new Error("Toko tidak ditemukan");

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id },
  });

  if (!product) throw new Error("Produk tidak ditemukan");

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/dashboard/products");
}

export async function getMyProducts() {
  const session = await requireAuth();
  const store = await prisma.storeProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!store) return [];

  return prisma.product.findMany({
    where: { storeId: store.id },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminDeleteProductAction(productId: string) {
  await requireRole("ADMIN");

  await prisma.product.delete({ where: { id: productId } });

  const session = await requireAuth();
  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "PRODUCT_TAKEDOWN",
      targetEntity: "Product",
      targetId: productId,
    },
  });

  revalidatePath("/admin/products");
}
