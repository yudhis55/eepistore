import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { ProductModeration } from "@/components/product-moderation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderasi Produk — Admin",
};

export default async function AdminProductsPage() {
  await requireRole("ADMIN");

  const products = await prisma.product.findMany({
    include: {
      store: { select: { storeName: true } },
      category: { select: { name: true } },
      images: { take: 1, orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">
        Moderasi Produk ({products.length})
      </h1>
      <ProductModeration products={products} />
    </main>
  );
}
