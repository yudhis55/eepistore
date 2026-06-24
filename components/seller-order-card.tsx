"use client";

import { useState, useTransition } from "react";
import {
  verifyPaymentAction,
  rejectPaymentAction,
  updateOrderStatusAction,
  markCodReceivedAction,
} from "@/features/order/actions";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

type Order = {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: { toNumber: () => number };
  buyer: { name: string; email: string };
  items: {
    id: string;
    quantity: number;
    priceAtPurchase: { toNumber: () => number };
    product: { name: string; images: { imageUrl: string }[] };
  }[];
  payment: { status: string; proofImageUrl: string | null } | null;
};

export function SellerOrderCard({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition();
  const [showProof, setShowProof] = useState(false);

  const statusLabel: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
    MENUNGGU_KONFIRMASI: "Menunggu Konfirmasi",
    DIPROSES: "Diproses",
    SIAP_DIAMBIL: "Siap Diambil",
    SELESAI: "Selesai",
    DIBATALKAN: "Dibatalkan",
  };

  const statusColor: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: "bg-warning/20 text-warning",
    MENUNGGU_KONFIRMASI: "bg-warning/20 text-warning",
    DIPROSES: "bg-brand-navy-700/20 text-brand-navy-700",
    SIAP_DIAMBIL: "bg-brand-gold-500/20 text-brand-gold-500",
    SELESAI: "bg-success/20 text-success",
    DIBATALKAN: "bg-danger/20 text-danger",
  };

  function run(fn: () => Promise<unknown>) {
    startTransition(async () => {
      await fn();
    });
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div>
          <p className="text-sm font-medium">#{order.id.slice(-8)}</p>
          <p className="text-xs text-neutral-500">{order.buyer.name}</p>
        </div>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusColor[order.status]}`}>
          {statusLabel[order.status]}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-neutral-500">
              {item.product.name} x {item.quantity}
            </span>
            <span>{formatPrice(item.priceAtPurchase.toNumber() * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <div className="flex gap-2 text-xs text-neutral-500">
          <span>{order.paymentMethod === "COD" ? "COD" : "Transfer"}</span>
        </div>
        <span className="font-bold text-brand-navy-900">
          {formatPrice(order.totalAmount.toNumber())}
        </span>
      </div>

      {/* Action buttons based on status */}
      <div className="mt-3 space-y-2">
        {order.status === "MENUNGGU_KONFIRMASI" && order.payment?.proofImageUrl && (
          <>
            <button
              onClick={() => setShowProof(!showProof)}
              className="text-xs text-brand-navy-700 hover:underline"
            >
              {showProof ? "Sembunyikan" : "Lihat"} bukti transfer
            </button>
            {showProof && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={order.payment.proofImageUrl}
                alt="Bukti transfer"
                className="w-full rounded border border-border"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => run(() => verifyPaymentAction(order.id))}
                disabled={isPending}
                className="flex-1 rounded bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Verifikasi
              </button>
              <button
                onClick={() => run(() => rejectPaymentAction(order.id, "Bukti tidak valid"))}
                disabled={isPending}
                className="flex-1 rounded bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                Tolak
              </button>
            </div>
          </>
        )}

        {order.status === "DIPROSES" && (
          <>
            {order.paymentMethod === "COD" && (
              <button
                onClick={() => run(() => markCodReceivedAction(order.id))}
                disabled={isPending}
                className="w-full rounded bg-brand-gold-500 px-3 py-1.5 text-xs font-medium text-brand-navy-900 hover:opacity-90 disabled:opacity-50"
              >
                COD Diterima
              </button>
            )}
            <button
              onClick={() => run(() => updateOrderStatusAction(order.id, "SIAP_DIAMBIL"))}
              disabled={isPending}
              className="w-full rounded bg-brand-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
            >
              Siap Diambil
            </button>
          </>
        )}

        {order.status === "SIAP_DIAMBIL" && (
          <button
            onClick={() => run(() => updateOrderStatusAction(order.id, "SELESAI"))}
            disabled={isPending}
            className="w-full rounded bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Tandai Selesai
          </button>
        )}
      </div>
    </div>
  );
}
