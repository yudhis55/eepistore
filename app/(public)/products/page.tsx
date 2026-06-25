import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getCategoriesTree, type ProductFilter } from "@/features/catalog/queries";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { SortSelect } from "@/components/sort-select";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Produk — EEPISTORE" };

const SORT_LABEL: Record<string, string> = {
  newest: "Terbaru",
  cheapest: "Termurah",
  most_expensive: "Termahal",
  popular: "Terlaris",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter: ProductFilter = {
    search: typeof params.q === "string" ? params.q : undefined,
    categoryId: typeof params.cat === "string" ? params.cat : undefined,
    condition: typeof params.cond === "string" ? (params.cond as "NEW" | "PRELOVED") : undefined,
    minPrice: typeof params.min === "string" ? Number(params.min) : undefined,
    maxPrice: typeof params.max === "string" ? Number(params.max) : undefined,
    sortBy: typeof params.sort === "string" ? (params.sort as ProductFilter["sortBy"]) : "newest",
    page: typeof params.page === "string" ? Number(params.page) : 1,
  };

  const [{ products, total, page, totalPages }, categories] = await Promise.all([
    getProducts(filter),
    getCategoriesTree(),
  ]);

  // Build the href that drops ONE query param (for active-filter chips).
  const withoutParam = (key: string) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({
      ...(filter.search ? { q: filter.search } : {}),
      ...(filter.categoryId ? { cat: filter.categoryId } : {}),
      ...(filter.condition ? { cond: filter.condition } : {}),
      ...(filter.minPrice ? { min: String(filter.minPrice) } : {}),
      ...(filter.maxPrice ? { max: String(filter.maxPrice) } : {}),
      ...(filter.sortBy && filter.sortBy !== "newest" ? { sort: filter.sortBy } : {}),
    })) {
      if (k !== key) next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  const activeChips: { key: string; label: string }[] = [];
  if (filter.search) activeChips.push({ key: "q", label: `“${filter.search}”` });
  if (filter.categoryId) {
    const cat = categories.find((c) => c.id === filter.categoryId);
    activeChips.push({ key: "cat", label: cat?.name ?? "Kategori" });
  }
  if (filter.condition)
    activeChips.push({ key: "cond", label: filter.condition === "NEW" ? "Baru" : "Preloved" });
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    activeChips.push({
      key: "price",
      label: `${filter.minPrice ?? 0}–${filter.maxPrice ?? "∞"}`,
    });
  }

  const pageHref = (p: number) => {
    const qs = new URLSearchParams({
      ...(filter.search ? { q: filter.search } : {}),
      ...(filter.categoryId ? { cat: filter.categoryId } : {}),
      ...(filter.condition ? { cond: filter.condition } : {}),
      ...(filter.sortBy && filter.sortBy !== "newest" ? { sort: filter.sortBy } : {}),
      page: String(p),
    });
    return `?${qs.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader title="Katalog Produk" description={`${total} produk ditemukan`} />

      <div className="flex gap-6">
        {/* Filter sidebar — sticky, desktop only (mobile filters via category page links). */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-20">
            <CategoryFilter categories={categories} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar: sort + active chips */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.length === 0 ? (
                <span className="text-sm text-neutral-500">Semua produk</span>
              ) : (
                activeChips.map((chip) => (
                  <Link
                    key={chip.key}
                    href={withoutParam(chip.key === "price" ? "min" : chip.key)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:border-brand-navy-700 hover:bg-neutral-50"
                  >
                    {chip.label}
                    <svg
                      className="h-3 w-3 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                    <span className="sr-only">Hapus filter {chip.label}</span>
                  </Link>
                ))
              )}
              {activeChips.length > 1 && (
                <Link
                  href="/products"
                  className="text-xs font-medium text-brand-navy-700 hover:underline"
                >
                  Reset semua
                </Link>
              )}
            </div>

            <SortSelect current={filter.sortBy ?? "newest"} labels={SORT_LABEL} />
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={<SearchGlyph />}
              title="Tidak ada produk yang cocok"
              description="Coba ubah filter atau kata kunci pencarian untuk melihat produk lain."
              action={
                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-brand-navy-900 transition-colors hover:bg-neutral-100"
                >
                  Reset filter
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  condition={product.condition}
                  imageUrl={product.images[0]?.imageUrl}
                  storeName={product.store.storeName}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={pageHref(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700",
                    p === page
                      ? "bg-brand-navy-900 text-white"
                      : "border border-border bg-surface text-neutral-700 hover:bg-neutral-100",
                  )}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
