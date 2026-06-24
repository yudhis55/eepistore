"use client";

import { useActionState } from "react";
import { createVoucherAction, type VoucherActionState } from "@/features/voucher/actions";

export function VoucherForm() {
  const [state, formAction, pending] = useActionState<VoucherActionState, FormData>(
    createVoucherAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Kode Voucher</label>
        <input
          name="code"
          type="text"
          required
          placeholder="HEMAT10"
          className="w-full rounded-lg border border-border px-3 py-2 uppercase outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tipe Diskon</label>
        <select
          name="discountType"
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        >
          <option value="PERCENTAGE">Persentase (%)</option>
          <option value="NOMINAL">Nominal (IDR)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Nilai</label>
          <input
            name="value"
            type="number"
            min="0"
            required
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Max Discount</label>
          <input
            name="maxDiscount"
            type="number"
            min="0"
            placeholder="Opsional"
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Min Purchase</label>
          <input
            name="minPurchase"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Kuota</label>
          <input
            name="quota"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Berlaku Dari</label>
          <input
            name="validFrom"
            type="datetime-local"
            required
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Berlaku Sampai</label>
          <input
            name="validUntil"
            type="datetime-local"
            required
            className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" value="true" defaultChecked />
        Aktif
      </label>

      {state.error && (
        <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded bg-success/10 px-3 py-2 text-sm text-success">Voucher dibuat.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-navy-900 px-4 py-2 font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Menyimpan..." : "Simpan Voucher"}
      </button>
    </form>
  );
}
