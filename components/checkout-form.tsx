"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutAction, type CheckoutResult } from "@/features/cart/checkout-actions";

type CartGroup = {
  storeId: string;
  storeName: string;
  items: { id: string; product: { id: string; name: string } }[];
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export function CheckoutForm({
  groups,
  totalPrice,
  checkoutToken,
}: {
  groups: CartGroup[];
  totalPrice: number;
  checkoutToken: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CheckoutResult, FormData>(checkoutAction, {
    success: false,
  });

  const [deliveryMethod, setDeliveryMethod] = useState("PICKUP_COD");
  const [paymentMethod, setPaymentMethod] = useState("MANUAL_TRANSFER");

  // Redirect on success
  if (state.success && state.orderIds) {
    router.push(`/orders?checkout=success`);
  }

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border p-4">
      <input type="hidden" name="checkoutToken" value={checkoutToken} />
      <h2 className="text-sm font-semibold">Detail Pengiriman & Pembayaran</h2>

      {/* Delivery method */}
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Metode Pengiriman</label>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2 text-sm hover:bg-neutral-100">
            <input
              type="radio"
              name="deliveryMethod"
              value="PICKUP_COD"
              checked={deliveryMethod === "PICKUP_COD"}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
            Ambil langsung / COD di kampus
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2 text-sm hover:bg-neutral-100">
            <input
              type="radio"
              name="deliveryMethod"
              value="MANUAL_DELIVERY"
              checked={deliveryMethod === "MANUAL_DELIVERY"}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            />
            Diantar seller (dikoordinasi via chat)
          </label>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Metode Pembayaran</label>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2 text-sm hover:bg-neutral-100">
            <input
              type="radio"
              name="paymentMethod"
              value="MANUAL_TRANSFER"
              checked={paymentMethod === "MANUAL_TRANSFER"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Transfer Manual (upload bukti)
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded border border-border p-2 text-sm hover:bg-neutral-100">
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            COD (bayar saat barang diterima)
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="mb-1 block text-xs font-medium text-neutral-500">
          Catatan (opsional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Catatan untuk seller..."
          className="w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      {/* Total */}
      <div className="border-t border-border pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">
            Total ({groups.reduce((sum, g) => sum + g.items.length, 0)} item)
          </span>
          <span className="text-lg font-bold text-brand-navy-900">{formatPrice(totalPrice)}</span>
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          Order akan dipecah per toko: {groups.length} toko
        </p>
      </div>

      {state.error && (
        <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-navy-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Memproses..." : "Buat Pesanan"}
      </button>
    </form>
  );
}
