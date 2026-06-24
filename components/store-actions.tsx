"use client";

import { approveStoreAction, rejectStoreAction } from "@/features/store/actions";

export function StoreActions({ storeId }: { storeId: string }) {
  return (
    <div className="flex gap-2">
      <form
        action={async () => {
          await approveStoreAction(storeId);
        }}
      >
        <button
          type="submit"
          className="rounded bg-success px-3 py-1 text-xs font-medium text-white hover:opacity-90"
        >
          Setujui
        </button>
      </form>
      <form
        action={async () => {
          await rejectStoreAction(storeId, "Tidak memenuhi syarat");
        }}
      >
        <button
          type="submit"
          className="rounded bg-danger px-3 py-1 text-xs font-medium text-white hover:opacity-90"
        >
          Tolak
        </button>
      </form>
    </div>
  );
}
