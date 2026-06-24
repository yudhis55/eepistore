import { getWishlist } from "@/features/review/actions";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist — EEPISTORE",
};

export default async function WishlistPage() {
  const items = await getWishlist();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Wishlist ({items.length})</h1>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Wishlist Anda kosong.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700"
          >
            Lihat Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              id={item.product.id}
              name={item.product.name}
              price={Number(item.product.price)}
              condition={item.product.condition}
              imageUrl={item.product.images[0]?.imageUrl}
              storeName={item.product.store.storeName}
            />
          ))}
        </div>
      )}
    </main>
  );
}
