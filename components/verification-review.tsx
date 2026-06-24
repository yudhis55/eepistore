"use client";

import { useState, useTransition } from "react";
import {
  approveVerificationAction,
  rejectVerificationAction,
} from "@/features/verification/actions";

type Verification = {
  id: string;
  name: string;
  email: string;
  nim: string | null;
  ktmImageUrl: string | null;
  submittedAt: string | Date;
};

export function VerificationReview({ verification: v }: { verification: Verification }) {
  const [isPending, startTransition] = useTransition();
  const [showImage, setShowImage] = useState(false);

  function handleApprove() {
    if (!confirm(`Setujui verifikasi untuk ${v.name}?`)) return;
    startTransition(async () => {
      await approveVerificationAction(v.id);
      window.location.reload();
    });
  }

  function handleReject() {
    const reason = prompt("Alasan penolakan:");
    if (!reason) return;
    startTransition(async () => {
      await rejectVerificationAction(v.id, reason);
      window.location.reload();
    });
  }

  return (
    <div className="rounded-lg border border-border p-4">
      {" "}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{v.name}</p>
          <p className="text-xs text-neutral-500">{v.email}</p>
          <p className="text-xs text-neutral-500">NIM: {v.nim}</p>
        </div>
        <span className="rounded bg-warning/20 px-2 py-0.5 text-xs text-warning">Pending</span>
      </div>
      {v.ktmImageUrl && (
        <div className="mt-3">
          <button
            onClick={() => setShowImage(!showImage)}
            className="text-xs text-brand-navy-700 hover:underline"
          >
            {showImage ? "Sembunyikan" : "Lihat"} foto KTM
          </button>
          {showImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={v.ktmImageUrl}
              alt="KTM"
              className="mt-2 w-full rounded border border-border"
            />
          )}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="flex-1 rounded bg-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Setujui
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="flex-1 rounded bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          Tolak
        </button>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Diajukan: {new Date(v.submittedAt).toLocaleString("id-ID")}
      </p>
    </div>
  );
}
