import type { Metadata } from "next";
import Link from "next/link";
import { getCart } from "@/features/cart/actions";
import { CartItem } from "@/components/cart-item";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Keranjang — EEPISTORE" };

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default async function CartPage() {
  const { groups, totalItems, totalPrice } = await getCart();

  return (
    <>
      <PageHeader title={`Keranjang (${totalItems})`} description="Tinjau item sebelum checkout." />

      {totalItems === 0 ? (
        <EmptyState
          icon={<CartIcon />}
          title="Keranjang Anda kosong"
          description="Jelajahi katalog dan temukan kebutuhan praktikum, modul, atau barang preloved dari teman PENS."
          action={
            <Link href="/products" className={buttonVariants({ variant: "primary" })}>
              Mulai Belanja
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart items grouped by store */}
          <div className="space-y-4 lg:col-span-2">
            {groups.map((group) => (
              <Card key={group.storeId} className="p-4">
                <Link
                  href={`/stores/${group.storeId}`}
                  className="mb-3 block text-sm font-semibold text-brand-navy-700 hover:underline"
                >
                  {group.storeName}
                </Link>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <CartItem
                      key={item.id}
                      id={item.id}
                      productId={item.product.id}
                      name={item.product.name}
                      price={Number(item.product.price)}
                      quantity={item.quantity}
                      imageUrl={item.product.images[0]?.imageUrl}
                      stock={item.product.stock}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 p-4">
              <h2 className="mb-3 text-sm font-semibold text-neutral-900">Ringkasan</h2>
              <div className="flex items-baseline justify-between border-b border-border pb-3 text-sm">
                <span className="text-neutral-500">Total ({totalItems} item)</span>
                <span className="font-mono text-lg font-bold tabular-nums text-brand-navy-900">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <Link
                href="/checkout"
                className={`${buttonVariants({ variant: "primary", size: "lg" })} mt-4 w-full`}
              >
                Checkout
              </Link>
              <p className="mt-3 text-center text-xs text-neutral-500">
                Bayar transfer manual atau COD — temu di kampus.
              </p>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

function CartIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 3h2.5l2.2 12.4a1.5 1.5 0 001.48 1.21h9.1a1.5 1.5 0 001.47-1.18L21 7H5.2"
      />
    </svg>
  );
}
