import { prisma } from "@/lib/prisma";
import type { ProductCondition, ProductStatus } from "@/lib/generated/prisma/client";

export type ProductFilter = {
  search?: string;
  categoryId?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "cheapest" | "most_expensive" | "popular";
  page?: number;
  perPage?: number;
};

export async function getProducts(filter: ProductFilter = {}) {
  const {
    search,
    categoryId,
    condition,
    minPrice,
    maxPrice,
    sortBy = "newest",
    page = 1,
    perPage = 12,
  } = filter;

  const where = {
    status: "ACTIVE" as ProductStatus,
    ...(categoryId ? { categoryId } : {}),
    ...(condition ? { condition } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy = {
    newest: { createdAt: "desc" as const },
    cheapest: { price: "asc" as const },
    most_expensive: { price: "desc" as const },
    popular: { createdAt: "desc" as const }, // TODO: use review count/rating
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        store: { select: { id: true, storeName: true, logoUrl: true } },
      },
      orderBy: orderBy[sortBy],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      category: true,
      store: {
        select: {
          id: true,
          storeName: true,
          description: true,
          logoUrl: true,
          pickupLocation: true,
          status: true,
          user: { select: { isVerifiedStudent: true } },
        },
      },
      reviews: {
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getStorefront(storeId: string) {
  const store = await prisma.storeProfile.findUnique({
    where: { id: storeId, status: "APPROVED" },
    select: {
      id: true,
      storeName: true,
      description: true,
      logoUrl: true,
      pickupLocation: true,
      user: { select: { isVerifiedStudent: true } },
    },
  });

  if (!store) return null;

  const products = await prisma.product.findMany({
    where: { storeId, status: "ACTIVE" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return { store, products };
}

export async function getCategoriesTree() {
  const categories = await prisma.category.findMany({
    include: {
      children: {
        include: {
          _count: { select: { products: true } },
        },
      },
      _count: { select: { products: true } },
    },
    where: { parentId: null },
    orderBy: { name: "asc" },
  });

  return categories;
}
