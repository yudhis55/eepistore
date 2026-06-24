"use client";

import { useState, useTransition } from "react";
import { addAddressAction, deleteAddressAction } from "@/features/profile/actions";

type Address = {
  id: string;
  label: string;
  detail: string;
  isDefault: boolean;
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [items, setItems] = useState(addresses);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAddressAction(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await addAddressAction({}, formData);
    if (result.error) {
      setError(result.error);
    } else {
      setShowForm(false);
      e.currentTarget.reset();
      // Refresh addresses
      window.location.reload();
    }
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && !showForm && (
        <p className="text-sm text-neutral-500">Belum ada alamat tersimpan.</p>
      )}

      {items.map((addr) => (
        <div key={addr.id} className="rounded border border-border p-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{addr.label}</span>
                {addr.isDefault && (
                  <span className="rounded bg-brand-gold-500/20 px-1.5 py-0.5 text-xs text-brand-gold-500">
                    Utama
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-500">{addr.detail}</p>
            </div>
            <button
              onClick={() => handleDelete(addr.id)}
              disabled={isPending}
              className="text-xs text-danger hover:underline disabled:opacity-50"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-3 rounded border border-border p-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Label (Rumah, Kos, dll)
            </label>
            <input
              name="label"
              type="text"
              required
              className="w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-navy-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">Detail Alamat</label>
            <textarea
              name="detail"
              rows={2}
              required
              className="w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-navy-700"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" value="true" />
            Jadikan alamat utama
          </label>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-brand-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-navy-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border border-border px-3 py-1.5 text-xs"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded border border-dashed border-border py-2 text-sm text-neutral-500 hover:bg-neutral-100"
        >
          + Tambah Alamat
        </button>
      )}
    </div>
  );
}
