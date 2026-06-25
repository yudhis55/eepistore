import Link from "next/link";
import { Suspense } from "react";
import {
  getProducts,
  getCategoriesTree,
  getTrendingProducts,
  getRecentReviews,
} from "@/features/catalog/queries";
import { getActiveBanners } from "@/features/banner/actions";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { RatingStars } from "@/components/ui/rating";

export default async function HomePage() {
  const [{ products }, categories, banners, trending, reviews] = await Promise.all([
    getProducts({ perPage: 8, sortBy: "newest" }),
    getCategoriesTree(),
    getActiveBanners(),
    getTrendingProducts(4),
    getRecentReviews(3),
  ]);

  // Up to 6 categories for the visual grid.
  const homeCategories = categories.slice(0, 6);

  return (
    <>
      {/* Hero — committed navy surface + Signal Trace motion (unchanged). */}
      <section className="eepi-hero relative overflow-hidden bg-brand-navy-900 px-4 py-16 text-white sm:py-20">
        <div className="eepi-hero__hairline pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/15" />
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eepi-hero__eyebrow text-balance text-sm font-medium tracking-wide text-brand-gold-300">
              Khusus civitas akademika PENS
            </p>
            <h1 className="eepi-hero__title mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Jual-beli antar mahasiswa PENS, di satu tempat.
            </h1>
            <p className="eepi-hero__sub mt-4 text-pretty text-lg text-white/85">
              Komponen praktikum, modul, merchandise kampus, dan barang preloved — dari teman
              seperjuangan, bukan toko acak.
            </p>
            <div className="eepi-hero__cta mx-auto mt-8 max-w-xl">
              <Suspense fallback={<HeroSearchFallback />}>
                <SearchBar />
              </Suspense>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white/85">
                <span>atau</span>
                <Link
                  href="/products"
                  className="inline-flex min-h-11 items-center rounded-lg bg-brand-gold-500 px-6 py-3 font-semibold text-brand-navy-900 transition-colors hover:bg-brand-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-300"
                >
                  Jelajahi semua produk
                </Link>
              </div>
            </div>
          </div>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
.eepi-hero .eepi-hero__eyebrow { clip-path: inset(0 100% 0 0); animation: eepi-hero-wipe 520ms cubic-bezier(0.22,1,0.36,1) 60ms forwards; }
.eepi-hero .eepi-hero__title, .eepi-hero .eepi-hero__sub, .eepi-hero .eepi-hero__cta { opacity: 1; filter: blur(6px); transform: translateY(10px); animation: eepi-hero-focus 520ms cubic-bezier(0.22,1,0.36,1) forwards; }
.eepi-hero .eepi-hero__title { animation-delay: 130ms; }
.eepi-hero .eepi-hero__sub { animation-delay: 200ms; }
.eepi-hero .eepi-hero__cta { animation-delay: 270ms; }
.eepi-hero .eepi-hero__hairline { transform: scaleX(0); transform-origin: left center; animation: eepi-hero-draw 520ms cubic-bezier(0.22,1,0.36,1) 120ms forwards; }
@keyframes eepi-hero-wipe { to { clip-path: inset(0 0 0 0); } }
@keyframes eepi-hero-focus { to { opacity: 1; filter: blur(0); transform: translateY(0); } }
@keyframes eepi-hero-draw { to { transform: scaleX(1); } }
@media (prefers-reduced-motion: reduce) {
  .eepi-hero .eepi-hero__eyebrow, .eepi-hero .eepi-hero__title, .eepi-hero .eepi-hero__sub, .eepi-hero .eepi-hero__cta, .eepi-hero .eepi-hero__hairline { animation: none; clip-path: none; filter: none; transform: none; opacity: 1; }
}
`,
          }}
        />
      </section>

      {/* Trust strip */}
      <section aria-label="Kenapa EEPISTORE" className="border-b border-border bg-surface">
        <div className="container mx-auto grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <TrustItem
            title="Verifikasi mahasiswa"
            desc="Penjual diverifikasi sebagai mahasiswa PENS — bukan akun anonim."
          />
          <TrustItem
            title="Bertemu di kampus"
            desc="COD atau temu langsung di area kampus. Tanpa ribet ongkir antar pulau."
          />
          <TrustItem
            title="Riwayat & ulasan"
            desc="Setiap transaksi tercatat. Lihat rating toko sebelum beli."
          />
        </div>
      </section>

      {/* Categories — visual grid */}
      {homeCategories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-h2 text-brand-navy-900">Jelajah kategori</h2>
            <Link
              href="/products"
              className="text-sm font-medium text-brand-navy-700 hover:underline"
            >
              Semua produk →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {homeCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?cat=${cat.id}`}
                className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-5 text-center transition-all hover:-translate-y-0.5 hover:border-brand-navy-700 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy-900/5 text-brand-navy-900 transition-colors group-hover:bg-brand-navy-900 group-hover:text-white">
                  <CategoryGlyph name={cat.name} />
                </span>
                <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                <span className="text-xs text-neutral-500">{cat._count.products} produk</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works — 3-step (numbered is earned: real ordered process). */}
      <section className="bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-h2 text-brand-navy-900">
            Cara belanja di EEPISTORE
          </h2>
          <ol className="grid gap-6 md:grid-cols-3">
            <Step
              n={1}
              title="Cari & pilih"
              desc="Temukan komponen, modul, atau barang preloved dari mahasiswa PENS. Chat penjual untuk nego atau tanya stok."
            />
            <Step
              n={2}
              title="Bayar fleksibel"
              desc="Transfer manual (lengkap dengan bukti) atau COD — bayar saat bertemu. Pilih yang nyaman buatmu."
            />
            <Step
              n={3}
              title="Temu di kampus"
              desc="Sepakati tempat temu di area kampus. Terima barang, konfirmasi selesai, beri ulasan."
            />
          </ol>
        </div>
      </section>

      {/* Trending products */}
      {trending.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-h2 text-brand-navy-900">Lagi trending</h2>
            <Link
              href="/products?sort=popular"
              className="text-sm font-medium text-brand-navy-700 hover:underline"
            >
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {trending.map((product) => (
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
        </section>
      )}

      {/* Banners */}
      {banners.length > 0 && (
        <section className="container mx-auto px-4 pb-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {banners.map((banner) => {
              const img = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-32 w-full object-cover sm:h-40"
                />
              );
              return (
                <div key={banner.id} className="overflow-hidden rounded-lg border border-border">
                  {banner.linkUrl ? (
                    <Link href={banner.linkUrl} className="block">
                      {img}
                    </Link>
                  ) : (
                    img
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Latest products */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-h2 text-brand-navy-900">Produk Terbaru</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-brand-navy-700 hover:underline"
          >
            Lihat semua →
          </Link>
        </div>
        {products.length === 0 ? (
          <EmptyState
            icon={<PlusIcon />}
            title="Belum ada produk"
            description="Jadi yang pertama jualan ke teman PENS, atau lihat seluruh katalog yang tersedia."
            action={
              <Link
                href="/dashboard/products/new"
                className="inline-flex min-h-11 items-center rounded-lg bg-brand-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-700"
              >
                Mulai jualan
              </Link>
            }
            secondaryAction={
              <Link
                href="/products"
                className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-brand-navy-900 transition-colors hover:bg-neutral-100"
              >
                Lihat katalog
              </Link>
            }
          />
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

      {/* Social proof — real buyer reviews */}
      {reviews.length > 0 && (
        <section className="bg-neutral-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-h2 text-brand-navy-900">Kata mahasiswa PENS</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {reviews.map((review) => (
                <figure
                  key={review.id}
                  className="flex flex-col rounded-lg border border-border bg-surface p-5"
                >
                  <RatingStars value={review.rating} showValue={false} />
                  <blockquote className="mt-3 flex-1 text-pretty text-sm text-neutral-700">
                    &ldquo;{review.comment}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy-900 text-xs font-semibold text-white">
                      {review.user.name?.[0] ?? "U"}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">{review.user.name}</span>
                    {review.product && (
                      <Link
                        href={`/products/${review.product.id}`}
                        className="ml-auto truncate text-xs text-neutral-500 hover:text-brand-navy-700 hover:underline"
                      >
                        {review.product.name}
                      </Link>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seller CTA — navy band */}
      <section className="bg-brand-navy-900 px-4 py-12 text-center text-white">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-balance text-h2">
            Punya barang bekas atau komponen? Jualan ke teman PENS.
          </h2>
          <p className="mt-3 text-pretty text-white/80">
            Buka toko gratis, kelola produk & pesanan dari satu dashboard. Transaksi tetap antar
            civitas kampus.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-brand-gold-500 px-6 py-3 font-semibold text-brand-navy-900 transition-colors hover:bg-brand-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-300"
          >
            Mulai jualan sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm text-neutral-500 sm:flex-row">
          <span className="font-bold text-brand-navy-900">EEPISTORE</span>
          <span>Marketplace civitas akademika PENS</span>
          <span>© 2026 EEPISTORE</span>
        </div>
      </footer>
    </>
  );
}

function TrustItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="px-4 py-5 sm:px-6">
      <h3 className="text-sm font-semibold text-brand-navy-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex gap-4">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy-900 font-mono text-base font-bold text-white"
        aria-hidden
      >
        {n}
      </span>
      <div>
        <h3 className="text-base font-semibold text-brand-navy-900">{title}</h3>
        <p className="mt-1 text-pretty text-sm text-neutral-600">{desc}</p>
      </div>
    </li>
  );
}

function HeroSearchFallback() {
  return <div className="h-11 w-full rounded-lg border border-white/20 bg-white/10" aria-hidden />;
}

function PlusIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

/** Lightweight category glyph — picks an icon by keyword in the category name. */
function CategoryGlyph({ name }: { name: string }) {
  const n = name.toLowerCase();
  if (n.includes("komponen") || n.includes("elektronik") || n.includes("praktikum"))
    return <CpuIcon />;
  if (n.includes("buku") || n.includes("modul") || n.includes("tulisan")) return <BookIcon />;
  if (n.includes("merch") || n.includes("kaos") || n.includes("pakaian")) return <ShirtIcon />;
  if (n.includes("preloved") || n.includes("bekas")) return <RecycleIcon />;
  return <TagIcon />;
}
function glyph(path: React.ReactNode) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      {path}
    </svg>
  );
}
function CpuIcon() {
  return glyph(
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <path strokeLinecap="round" d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>,
  );
}
function BookIcon() {
  return glyph(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2V5zM18 3v18"
    />,
  );
}
function ShirtIcon() {
  return glyph(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 3l-5 4 2 3 3-1v9h8v-9l3 1 2-3-5-4-2 2a3 3 0 01-6 0L8 3z"
    />,
  );
}
function RecycleIcon() {
  return glyph(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 19l-3-5 3-1M4 14l2.5 4.5a2 2 0 001.7 1h4M17 5l3 5-3 1M20 10l-2.5-4.5A2 2 0 0015.8 4H12M12 4l2 3M9 8l3-4"
    />,
  );
}
function TagIcon() {
  return glyph(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12V4a1 1 0 011-1h8l9 9-9 9-9-9zM7.5 7.5h.01"
    />,
  );
}
