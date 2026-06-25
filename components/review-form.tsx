"use client";

import { useActionState, useState } from "react";
import { createReviewAction, type ReviewActionState } from "@/features/review/actions";
import { Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function ReviewForm({ orderItemId }: { orderItemId: string }) {
  const [state, formAction, pending] = useActionState<ReviewActionState, FormData>(
    createReviewAction,
    {},
  );
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderItemId" value={orderItemId} />
      <input type="hidden" name="rating" value={rating} />

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-foreground">Rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating bintang">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hover || rating);
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} bintang`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-brand-gold-500 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700"
              >
                <Star
                  className={cn("h-6 w-6", active ? "text-brand-gold-500" : "text-neutral-300")}
                  filled={active}
                />
              </button>
            );
          })}
        </div>
      </fieldset>

      <FormField label="Komentar (opsional)" htmlFor="comment">
        <Textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={1000}
          placeholder="Bagikan pengalaman belanja Anda…"
        />
      </FormField>

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Review terkirim. Terima kasih!
        </p>
      )}

      <Button type="submit" loading={pending} disabled={pending}>
        Kirim Review
      </Button>
    </form>
  );
}

function Star({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden
    >
      <path d="M12 2l2.9 6.26L21.8 9.27l-5 4.87 1.18 6.88L12 17.77l-6.98 3.25L6.2 14.14l-5-4.87 6.9-1.01L12 2z" />
    </svg>
  );
}
