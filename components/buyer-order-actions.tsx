"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmReceivedAction, cancelOrderAction } from "@/features/order/actions";

export function BuyerOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleConfirmReceived() {
    setError("");
    startTransition(async () => {
      const result = await confirmReceivedAction(orderId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleCancel() {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    setError("");
    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      {error && <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

      {status === "SIAP_DIAMBIL" && (
        <button
          onClick={handleConfirmReceived}
          disabled={isPending}
          className="w-full rounded-lg bg-success px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Konfirmasi Diterima"}
        </button>
      )}

      {status === "MENUNGGU_PEMBAYARAN" && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="w-full rounded-lg border border-danger px-4 py-2.5 font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
        >
          {isPending ? "Memproses..." : "Batalkan Pesanan"}
        </button>
      )}
    </div>
  );
}
