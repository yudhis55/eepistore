"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/features/cart/actions";
import Link from "next/link";

export function AddToCartButton({ productId, stock }: { productId: string; stock: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  function handleAdd() {
    setError("");
    setAdded(false);
    startTransition(async () => {
      try {
        await addToCartAction(productId, 1);
        setAdded(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menambah ke keranjang");
      }
    });
  }

  if (stock === 0) {
    return (
      <button
        disabled
        className="w-full rounded-lg bg-neutral-100 px-4 py-2.5 font-medium text-neutral-500"
      >
        Stok Habis
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={isPending}
          className="flex-1 rounded-lg bg-brand-navy-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-navy-700 disabled:opacity-50"
        >
          {isPending ? "Menambah..." : "+ Keranjang"}
        </button>
        {added && (
          <Link
            href="/cart"
            className="rounded-lg bg-brand-gold-500 px-4 py-2.5 font-medium text-brand-navy-900 hover:bg-brand-gold-300"
          >
            Lihat Keranjang
          </Link>
        )}
      </div>
      {error && <p className="rounded bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
