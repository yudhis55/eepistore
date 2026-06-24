"use client";

import { useTransition } from "react";
import { deleteVoucherAction, toggleVoucherAction } from "@/features/voucher/actions";

type Voucher = {
  id: string;
  code: string;
  discountType: string;
  value: { toNumber: () => number };
  minPurchase: { toNumber: () => number };
  quota: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
};

const formatValue = (v: Voucher) => {
  const val = v.value.toNumber();
  if (v.discountType === "PERCENTAGE") return `${val}%`;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
};

export function VoucherManager({ vouchers }: { vouchers: Voucher[] }) {
  const [isPending, startTransition] = useTransition();

  if (vouchers.length === 0) {
    return <p className="text-sm text-neutral-500">Belum ada voucher.</p>;
  }

  return (
    <div className="space-y-2">
      {vouchers.map((v) => (
        <div key={v.id} className="rounded-lg border border-border p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono font-medium">{v.code}</p>
              <p className="text-xs text-neutral-500">
                {formatValue(v)} • Min: {v.minPurchase.toNumber().toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-neutral-500">
                Kuota: {v.usedCount}/{v.quota === 0 ? "∞" : v.quota}
              </p>
              <p className="text-xs text-neutral-500">
                {new Date(v.validFrom).toLocaleDateString("id-ID")} -{" "}
                {new Date(v.validUntil).toLocaleDateString("id-ID")}
              </p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs ${
                v.isActive ? "bg-success/20 text-success" : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {v.isActive ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => startTransition(() => toggleVoucherAction(v.id))}
              disabled={isPending}
              className="rounded border border-border px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50"
            >
              {v.isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
            <button
              onClick={() => {
                if (confirm("Hapus voucher?")) startTransition(() => deleteVoucherAction(v.id));
              }}
              disabled={isPending}
              className="rounded bg-danger px-2 py-1 text-xs text-white hover:opacity-90 disabled:opacity-50"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
