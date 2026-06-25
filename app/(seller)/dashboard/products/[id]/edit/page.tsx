import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getAllCategories } from "@/features/catalog/actions";
import { ProductEditForm } from "@/components/product-edit-form";
import { PageHeader, Breadcrumb } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Edit Produk — EEPISTORE" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categories = await getAllCategories();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, variants: true },
  });

  if (!product) notFound();

  return (
    <>
      <PageHeader
        title="Edit Produk"
        description={product.name}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Produk", href: "/dashboard/products/new" },
              { label: "Edit" },
            ]}
          />
        }
      />
      <div className="mx-auto max-w-2xl">
        <ProductEditForm product={product} categories={categories} />
      </div>
    </>
  );
}
