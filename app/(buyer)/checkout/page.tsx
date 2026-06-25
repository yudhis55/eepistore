import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCart } from "@/features/cart/actions";
import { CheckoutForm } from "@/components/checkout-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Checkout — EEPISTORE" };

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
    <>
      <PageHeader title="Checkout" description="Tinjau pesanan dan pilih metode pembayaran." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order summary */}
        <div className="space-y-4 lg:col-span-2">
          {groups.map((group) => (
            <Card key={group.storeId} className="p-4">
              <h2 className="mb-3 text-sm font-semibold text-brand-navy-700">{group.storeName}</h2>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-neutral-600">
                      {item.product.name}{" "}
                      <span className="text-neutral-400">× {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-mono font-medium tabular-nums text-neutral-900">
                      {formatPrice(Number(item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Checkout form */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <CheckoutForm groups={groups} totalPrice={totalPrice} />
          </div>
        </div>
      </div>
    </>
  );
}
