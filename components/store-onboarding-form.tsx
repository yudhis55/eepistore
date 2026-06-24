"use client";

import { useActionState } from "react";
import { applyStoreAction, type StoreActionState } from "@/features/store/actions";

export function StoreOnboardingForm() {
  const [state, formAction, pending] = useActionState<StoreActionState, FormData>(
    applyStoreAction,
    {},
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label htmlFor="storeName" className="mb-1 block text-sm font-medium">
          Nama Toko
        </label>
        <input
          id="storeName"
          name="storeName"
          type="text"
          required
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          Deskripsi Toko (opsional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      <div>
        <label htmlFor="pickupLocation" className="mb-1 block text-sm font-medium">
          Lokasi COD/Pengambilan (opsional)
        </label>
        <input
          id="pickupLocation"
          name="pickupLocation"
          type="text"
          className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-navy-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Mengirim..." : "Ajukan Toko"}
      </button>
    </form>
  );
}
