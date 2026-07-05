import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { getStorefront } from "@/features/catalog/queries";
import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { VerifiedGlyph } from "@/components/ui/verified-glyph";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getStorefront(id);
  if (!data) return { title: "Toko tidak ditemukan" };
  return { title: `${data.store.storeName} — EEPISTORE` };
}

export default async function StorefrontPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getStorefront(id);

  if (!data) notFound();

  const { store, products } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader title={store.storeName} description={store.description ?? undefined} />

      {/* Store meta */}
      <Card className="mb-8 flex items-center gap-4 p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-navy-900 text-white">
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.storeName}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold">{store.storeName[0]}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-navy-900">{store.storeName}</span>
            {store.user.isVerifiedStudent && (
              <VerifiedGlyph title="Toko terverifikasi mahasiswa PENS" />
            )}
          </div>
          {store.pickupLocation && (
            <p className="mt-1 text-xs text-neutral-500">Lokasi COD: {store.pickupLocation}</p>
          )}
        </div>
      </Card>

      {/* Products */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-h3 text-brand-navy-900">Produk Toko</h2>
        <span className="text-sm text-neutral-500">{products.length} produk</span>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<BoxIcon />}
          title="Toko ini belum memiliki produk"
          description="Produk dari toko ini akan muncul di sini saat tersedia."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={Number(product.price)}
              condition={product.condition}
              imageUrl={product.images[0]?.imageUrl}
              storeName={store.storeName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BoxIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 11v10"
      />
    </svg>
  );
}
