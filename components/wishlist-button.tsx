"use client";

import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/features/review/actions";

export function WishlistButton({
  productId,
  initialWishlisted,
}: {
  productId: string;
  initialWishlisted: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await toggleWishlistAction(productId);
      setWishlisted((prev) => !prev);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        wishlisted
          ? "border-danger/30 bg-danger/10 text-danger"
          : "border-border text-neutral-500 hover:bg-neutral-100"
      }`}
    >
      <svg
        className="h-4 w-4"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {wishlisted ? "Disimpan" : "Wishlist"}
    </button>
  );
}
