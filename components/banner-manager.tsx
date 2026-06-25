"use client";

import { useTransition } from "react";
import { deleteBannerAction, toggleBannerAction } from "@/features/banner/actions";

type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  position: number;
  isActive: boolean;
};

export function BannerManager({ banners }: { banners: Banner[] }) {
  const [isPending, startTransition] = useTransition();

  if (banners.length === 0) {
    return <p className="text-sm text-neutral-500">Belum ada banner.</p>;
  }

  return (
    <div className="space-y-2">
      {banners.map((b) => (
        <div key={b.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.imageUrl} alt={b.title} className="h-12 w-20 rounded object-cover" />

          <div className="flex-1">
            <p className="text-sm font-medium">{b.title}</p>
            <p className="text-xs text-neutral-500">Posisi: {b.position}</p>
          </div>

          <span
            className={`rounded px-2 py-0.5 text-xs ${
              b.isActive ? "bg-success/20 text-success" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {b.isActive ? "Aktif" : "Nonaktif"}
          </span>

          <div className="flex gap-1">
            <button
              onClick={() => startTransition(() => toggleBannerAction(b.id))}
              disabled={isPending}
              className="rounded border border-border px-2 py-1 text-xs hover:bg-neutral-100 disabled:opacity-50"
            >
              {b.isActive ? "Off" : "On"}
            </button>
            <button
              onClick={() => {
                if (confirm("Hapus banner?")) startTransition(() => deleteBannerAction(b.id));
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
