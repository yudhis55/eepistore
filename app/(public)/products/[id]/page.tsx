import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductById } from "@/features/catalog/queries";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating";
import { VerifiedGlyph } from "@/components/ui/verified-glyph";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Produk tidak ditemukan" };
  return { title: `${product.name} — EEPISTORE` };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav
        className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500"
        aria-label="Breadcrumb"
      >
        <Link href="/products" className="hover:text-brand-navy-700">
          Produk
        </Link>
        <span className="text-neutral-300" aria-hidden>
          /
        </span>
        <span className="font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-neutral-100">
            {product.images[0] ? (
              <Image
                src={product.images[0].imageUrl}
                alt={product.images[0].altText ?? product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">
                <svg
                  className="h-16 w-16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.16-5.16a2.25 2.25 0 013.18 0l5.16 5.16m-1.5-1.5l1.41-1.41a2.25 2.25 0 013.18 0l2.91 2.91M4.5 19.25h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded border border-border bg-neutral-100"
                >
                  <Image
                    src={img.imageUrl}
                    alt={img.altText ?? product.name}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <Badge variant="neutral">{product.category?.name ?? "Tanpa kategori"}</Badge>
            <h1 className="mt-2 text-balance text-h2 text-neutral-900">{product.name}</h1>
            {product.reviews.length > 0 && (
              <div className="mt-2">
                <RatingStars value={avgRating} count={product.reviews.length} size="md" />
              </div>
            )}
            <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-brand-navy-900">
              {formatPrice(Number(product.price))}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {product.condition === "PRELOVED" && (
              // Navy ink on warning fill — AA safe (white-on-warning was ~2.3:1).
              <span className="rounded-sm bg-warning px-2 py-0.5 text-xs font-semibold text-brand-navy-900">
                Preloved
              </span>
            )}
            {product.stock > 0 ? (
              <Badge variant="success" icon={<DotIcon />}>
                Stok: {product.stock}
              </Badge>
            ) : (
              <Badge variant="danger" icon={<XIcon />}>
                Stok habis
              </Badge>
            )}
          </div>

          {product.description && (
            <div>
              <h2 className="mb-1.5 text-sm font-semibold text-neutral-900">Deskripsi</h2>
              <p className="whitespace-pre-wrap text-pretty text-sm text-neutral-600">
                {product.description}
              </p>
            </div>
          )}

          {product.variants.length > 0 && (
            <div>
              <h2 className="mb-1.5 text-sm font-semibold text-neutral-900">Varian</h2>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <span
                    key={v.id}
                    className="rounded-md border border-border px-2.5 py-1 text-xs text-neutral-700"
                  >
                    {v.name}: {v.value}
                    {Number(v.priceAdjustment) !== 0 &&
                      ` (${Number(v.priceAdjustment) > 0 ? "+" : ""}${formatPrice(Number(v.priceAdjustment))})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Store info */}
          <Card className="p-3 transition-colors hover:bg-neutral-50">
            <Link href={`/stores/${product.store.id}`} className="block">
              <div className="flex items-center gap-3">
                {product.store.logoUrl ? (
                  <Image
                    src={product.store.logoUrl}
                    alt={product.store.storeName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy-900 text-sm font-semibold text-white">
                    {product.store.storeName[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-medium text-neutral-900">
                      {product.store.storeName}
                    </p>
                    {product.store.user.isVerifiedStudent && (
                      <VerifiedGlyph title="Toko terverifikasi mahasiswa PENS" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">Lihat toko</p>
                </div>
              </div>
            </Link>
          </Card>

          <div className="flex gap-2">
            <AddToCartButton productId={product.id} stock={product.stock} />
            <WishlistButton productId={product.id} initialWishlisted={false} />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-h3 text-brand-navy-900">Ulasan</h2>
          {product.reviews.length > 0 && (
            <RatingStars value={avgRating} count={product.reviews.length} size="md" />
          )}
        </div>

        {product.reviews.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-neutral-500">Belum ada ulasan untuk produk ini.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {product.reviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-neutral-900">{review.user.name}</span>
                  <RatingStars value={review.rating} showValue={false} />
                </div>
                {review.comment && (
                  <p className="mt-2 text-pretty text-sm text-neutral-600">{review.comment}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DotIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
