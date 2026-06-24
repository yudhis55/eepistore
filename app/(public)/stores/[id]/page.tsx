import { getStorefront } from "@/features/catalog/queries";
import { ProductCard } from "@/components/product-card";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
    <main className="container mx-auto px-4 py-8">
      {/* Store header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-navy-900 text-white">
          {store.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logoUrl} alt={store.storeName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold">{store.storeName[0]}</span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-brand-navy-900">{store.storeName}</h1>
            {store.user.isVerifiedStudent && (
              <span className="rounded bg-brand-gold-500/20 px-2 py-0.5 text-xs font-medium text-brand-gold-500">
                Verified
              </span>
            )}
          </div>
          {store.description && (
            <p className="mt-1 text-sm text-neutral-500">{store.description}</p>
          )}
          {store.pickupLocation && (
            <p className="mt-1 text-xs text-neutral-500">Lokasi COD: {store.pickupLocation}</p>
          )}
        </div>
      </div>

      {/* Products */}
      <h2 className="mb-4 text-lg font-semibold">Produk Toko ({products.length})</h2>

      {products.length === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Toko ini belum memiliki produk.</p>
        </div>
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
    </main>
  );
}
