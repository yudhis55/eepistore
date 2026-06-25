import { getWishlist } from "@/features/review/actions";
import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist — EEPISTORE",
};

export default async function WishlistPage() {
  const items = await getWishlist();

  return (
    <>
      <PageHeader
        title="Wishlist"
        description={
          items.length > 0
            ? `${items.length} produk tersimpan`
            : "Simpan produk favorit untuk dibeli nanti."
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="Wishlist Anda kosong"
          description="Tandai produk yang Anda minati untuk menyimpannya di sini."
          action={
            <Link className={buttonVariants({ variant: "primary" })} href="/products">
              Lihat Produk
            </Link>
          }
        />
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
    </>
  );
}
