"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmReceivedAction, cancelOrderAction } from "@/features/order/actions";
import { Button } from "@/components/ui/button";

export function BuyerOrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleConfirmReceived() {
    setError("");
    startTransition(async () => {
      const result = await confirmReceivedAction(orderId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleCancel() {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;
    setError("");
    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      {status === "SIAP_DIAMBIL" && (
        <Button
          variant="primary"
          className="w-full bg-success hover:bg-success/90 focus-visible:outline-success"
          loading={isPending}
          onClick={handleConfirmReceived}
        >
          {isPending ? "Memproses…" : "Konfirmasi Diterima"}
        </Button>
      )}

      {status === "MENUNGGU_PEMBAYARAN" && (
        <Button
          variant="secondary"
          className="w-full border-danger text-danger hover:bg-danger/10"
          loading={isPending}
          onClick={handleCancel}
        >
          {isPending ? "Memproses…" : "Batalkan Pesanan"}
        </Button>
      )}
    </div>
  );
}
