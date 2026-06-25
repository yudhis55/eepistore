"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <label htmlFor="eepi-search" className="sr-only">
        Cari produk
      </label>
      <input
        id="eepi-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari komponen, modul, preloved…"
        className="min-h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-neutral-500 focus:border-brand-navy-700 focus:ring-2 focus:ring-brand-navy-700/30"
      />
      <SearchIcon />
      {isPending ? (
        <span
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-brand-navy-700/30 border-t-brand-navy-700"
          role="status"
          aria-label="Mencari…"
        />
      ) : null}
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
