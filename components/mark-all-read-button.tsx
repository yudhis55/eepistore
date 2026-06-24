"use client";

import { useTransition } from "react";
import { markAllNotificationsReadAction } from "@/features/notification/actions";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
      disabled={isPending}
      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50"
    >
      {isPending ? "Menandai..." : "Tandai Semua Dibaca"}
    </button>
  );
}
