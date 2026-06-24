import { getCart } from "@/features/cart/actions";
import { CheckoutForm } from "@/components/checkout-form";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — EEPISTORE",
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export default async function CheckoutPage() {
  const { groups, totalItems, totalPrice } = await getCart();

  if (totalItems === 0) {
    redirect("/cart");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order summary */}
        <div className="space-y-4 lg:col-span-2">
          {groups.map((group) => (
            <div key={group.storeId} className="rounded-lg border border-border p-4">
              <h2 className="mb-3 text-sm font-semibold text-brand-navy-700">{group.storeName}</h2>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-500">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Checkout form */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <CheckoutForm groups={groups} totalPrice={totalPrice} />
          </div>
        </div>
      </div>
    </main>
  );
}
