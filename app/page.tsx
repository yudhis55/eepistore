import Link from "next/link";
import { getProducts, getCategoriesTree } from "@/features/catalog/queries";
import { getActiveBanners } from "@/features/banner/actions";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const [{ products }, categories, banners] = await Promise.all([
    getProducts({ perPage: 8, sortBy: "newest" }),
    getCategoriesTree(),
    getActiveBanners(),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-navy-900 to-brand-navy-700 px-4 py-16 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight">EEPISTORE</h1>
        <p className="mt-2 text-lg text-white/80">Marketplace Jual Beli Mahasiswa PENS</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-brand-gold-500 px-6 py-3 font-medium text-brand-navy-900 transition-colors hover:bg-brand-gold-300"
        >
          Mulai Belanja
        </Link>
      </section>

      {/* Banners */}
      {banners.length > 0 && (
        <section className="container mx-auto px-4 py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {banners.map((banner) => (
              <div key={banner.id} className="relative overflow-hidden rounded-lg">
                {banner.linkUrl ? (
                  <a href={banner.linkUrl}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-32 w-full object-cover sm:h-40"
                    />
                  </a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-32 w-full object-cover sm:h-40"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <h2 className="mb-4 text-lg font-bold text-brand-navy-900">Kategori</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?cat=${cat.id}`}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-neutral-500 transition-colors hover:border-brand-navy-700 hover:text-brand-navy-700"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest products */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-navy-900">Produk Terbaru</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-brand-navy-700 hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
            <p className="text-neutral-500">Belum ada produk.</p>
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
      </section>
    </main>
  );
}
