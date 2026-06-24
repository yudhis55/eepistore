import { getCart } from "@/features/cart/actions";
import { CartItem } from "@/components/cart-item";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keranjang — EEPISTORE",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default async function CartPage() {
  const { groups, totalItems, totalPrice } = await getCart();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Keranjang ({totalItems})</h1>

      {totalItems === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Keranjang Anda kosong.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart items grouped by store */}
          <div className="space-y-6 lg:col-span-2">
            {groups.map((group) => (
              <div key={group.storeId} className="rounded-lg border border-border p-4">
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
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg border border-border p-4">
              <h2 className="mb-3 text-sm font-semibold">Ringkasan</h2>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Total ({totalItems} item)</span>
                <span className="font-bold text-brand-navy-900">{formatPrice(totalPrice)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-4 block rounded-lg bg-brand-navy-900 px-4 py-2.5 text-center font-medium text-white transition-colors hover:bg-brand-navy-700"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
