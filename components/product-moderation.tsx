"use client";

import { useTransition } from "react";
import { adminDeleteProductAction } from "@/features/product/actions";

type Product = {
  id: string;
  name: string;
  status: string;
  condition: string;
  price: { toNumber: () => number };
  stock: number;
  store: { storeName: string };
  category: { name: string } | null;
  images: { imageUrl: string }[];
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export function ProductModeration({ products }: { products: Product[] }) {
  const [isPending, startTransition] = useTransition();

  function handleTakedown(id: string, name: string) {
    if (!confirm(`Takedown produk "${name}"? Tindakan ini akan menghapus produk.`)) return;
    startTransition(async () => {
      await adminDeleteProductAction(id);
      window.location.reload();
    });
  }

  if (products.length === 0) {
    return <p className="text-sm text-neutral-500">Belum ada produk.</p>;
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 rounded-lg border border-border p-3"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-neutral-100">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium">{product.name}</p>
            <p className="text-xs text-neutral-500">
              {product.store.storeName} • {product.category?.name ?? "Tanpa kategori"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">{formatPrice(product.price.toNumber())}</p>
            <p className="text-xs text-neutral-500">Stok: {product.stock}</p>
          </div>

          <span
            className={`rounded px-2 py-0.5 text-xs ${
              product.status === "ACTIVE"
                ? "bg-success/20 text-success"
                : product.status === "DRAFT"
                  ? "bg-neutral-100 text-neutral-500"
                  : "bg-danger/20 text-danger"
            }`}
          >
            {product.status}
          </span>

          <button
            onClick={() => handleTakedown(product.id, product.name)}
            disabled={isPending}
            className="rounded bg-danger px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Takedown
          </button>
        </div>
      ))}
    </div>
  );
}
