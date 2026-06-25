import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { ProductModeration } from "@/components/product-moderation";
import { PageHeader } from "@/components/ui/page-header";
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
    <>
      <PageHeader
        title="Moderasi Produk"
        description={`Tinjau dan moderasi produk yang diunggah penjual · ${products.length} produk`}
      />
      <ProductModeration products={products} />
    </>
  );
}
