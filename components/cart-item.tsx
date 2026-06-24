"use client";

import { useState, useTransition } from "react";
import { updateCartQtyAction, removeFromCartAction } from "@/features/cart/actions";
import Image from "next/image";

type CartItemProps = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stock: number;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export function CartItem({ id, name, price, quantity, imageUrl, stock }: CartItemProps) {
  const [qty, setQty] = useState(quantity);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleQtyChange(newQty: number) {
    if (newQty < 1) return;
    if (newQty > stock) {
      setError(`Stok maksimal: ${stock}`);
      return;
    }
    setError("");
    setQty(newQty);
    startTransition(async () => {
      await updateCartQtyAction(id, newQty);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFromCartAction(id);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill sizes="64px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-500">
            No img
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="line-clamp-1 text-sm font-medium">{name}</p>
        <p className="text-sm font-bold text-brand-navy-900">{formatPrice(price)}</p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQtyChange(qty - 1)}
          disabled={isPending || qty <= 1}
          className="flex h-7 w-7 items-center justify-center rounded border border-border text-sm disabled:opacity-50"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-medium">{qty}</span>
        <button
          onClick={() => handleQtyChange(qty + 1)}
          disabled={isPending || qty >= stock}
          className="flex h-7 w-7 items-center justify-center rounded border border-border text-sm disabled:opacity-50"
        >
          +
        </button>
      </div>

      <button
        onClick={handleRemove}
        disabled={isPending}
        className="ml-2 text-xs text-danger hover:underline disabled:opacity-50"
      >
        Hapus
      </button>
    </div>
  );
}
