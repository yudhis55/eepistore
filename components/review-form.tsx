"use client";

import { useActionState, useState } from "react";
import { createReviewAction, type ReviewActionState } from "@/features/review/actions";

export function ReviewForm({ orderItemId }: { orderItemId: string }) {
  const [state, formAction, pending] = useActionState<ReviewActionState, FormData>(
    createReviewAction,
    {},
  );

  const [rating, setRating] = useState(5);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderItemId" value={orderItemId} />

      <div>
        <label className="mb-1 block text-sm font-medium">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? "text-brand-gold-500" : "text-neutral-500"}`}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div>
        <label htmlFor="comment" className="mb-1 block text-sm font-medium">
          Komentar (opsional)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={2}
          maxLength={1000}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-navy-700"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Review terkirim!</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-navy-700 disabled:opacity-50"
      >
        {pending ? "Mengirim..." : "Kirim Review"}
      </button>
    </form>
  );
}
