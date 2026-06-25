"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

const OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Terbaru" },
  { value: "cheapest", label: "Termurah" },
  { value: "most_expensive", label: "Termahal" },
  { value: "popular", label: "Terlaris" },
];

/**
 * SortSelect — updates the `?sort=` query param on change, preserving all other
 * filters (cat/cond/min/max/q) and resetting to page 1. Native select for
 * mobile-friendliness and zero JS dependency on the open state.
 */
export function SortSelect({
  current,
  labels,
}: {
  current: string;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value && e.target.value !== "newest") {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-neutral-500">Urutkan</span>
      <div className="relative">
        <select
          value={current}
          onChange={handleChange}
          disabled={isPending}
          aria-label="Urutkan produk"
          className="min-h-9 appearance-none rounded-md border border-border bg-surface py-1.5 pl-3 pr-8 text-sm font-medium text-neutral-900 outline-none transition-colors hover:bg-neutral-50 focus:border-brand-navy-700 focus:ring-2 focus:ring-brand-navy-700/30 disabled:opacity-60"
        >
          {OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {labels[opt.value] ?? opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </label>
  );
}
