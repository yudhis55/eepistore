import { getProducts, getCategoriesTree, type ProductFilter } from "@/features/catalog/queries";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";
import { SearchBar } from "@/components/search-bar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produk — EEPISTORE",
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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy-900">Katalog Produk</h1>
        <p className="mt-1 text-sm text-neutral-500">{total} produk ditemukan</p>
      </div>

      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <CategoryFilter categories={categories} />
        </aside>

        <div className="flex-1">
          {products.length === 0 ? (
            <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
              <p className="text-neutral-500">Belum ada produk yang matching.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({
                    ...(filter.search ? { q: filter.search } : {}),
                    ...(filter.categoryId ? { cat: filter.categoryId } : {}),
                    ...(filter.condition ? { cond: filter.condition } : {}),
                    page: String(p),
                  })}`}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-brand-navy-900 text-white"
                      : "border border-border hover:bg-neutral-100"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
