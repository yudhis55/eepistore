import { getProductById } from "@/features/catalog/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

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
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
            {product.images[0] && (
              <Image
                src={product.images[0].imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
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
        <div className="space-y-4">
          <div>
            <span className="inline-block rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
              {product.category?.name ?? "Tanpa kategori"}
            </span>
            <h1 className="mt-2 text-2xl font-bold text-neutral-900">{product.name}</h1>
            <p className="mt-2 text-3xl font-bold text-brand-navy-900">
              {formatPrice(Number(product.price))}
            </p>
          </div>

          {product.condition === "PRELOVED" && (
            <span className="inline-block rounded bg-warning px-2 py-1 text-xs font-medium text-white">
              Preloved
            </span>
          )}

          {product.stock > 0 ? (
            <p className="text-sm text-success">Stok: {product.stock}</p>
          ) : (
            <p className="text-sm text-danger">Stok habis</p>
          )}

          {product.description && (
            <div>
              <h2 className="mb-1 text-sm font-semibold">Deskripsi</h2>
              <p className="whitespace-pre-wrap text-sm text-neutral-500">{product.description}</p>
            </div>
          )}

          {product.variants.length > 0 && (
            <div>
              <h2 className="mb-1 text-sm font-semibold">Varian</h2>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <span key={v.id} className="rounded border border-border px-2 py-1 text-xs">
                    {v.name}: {v.value}
                    {Number(v.priceAdjustment) !== 0 &&
                      ` (${Number(v.priceAdjustment) > 0 ? "+" : ""}${formatPrice(Number(v.priceAdjustment))})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Store info */}
          <Link
            href={`/stores/${product.store.id}`}
            className="block rounded-lg border border-border p-3 transition-colors hover:bg-neutral-100"
          >
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy-900 text-white">
                  {product.store.storeName[0]}
                </div>
              )}
              <div>
                <p className="font-medium text-neutral-900">{product.store.storeName}</p>
                {product.store.user.isVerifiedStudent && (
                  <span className="text-xs text-brand-gold-500">Verified PENS Student</span>
                )}
              </div>
            </div>
          </Link>

          {/* TODO: Add to cart button (Fase 1.2) */}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold">
            Ulasan ({product.reviews.length}) - Rata-rata: {avgRating.toFixed(1)}
          </h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.user.name}</span>
                  <span className="text-brand-gold-500">
                    {"★".repeat(review.rating)}
                    <span className="text-neutral-500">{"★".repeat(5 - review.rating)}</span>
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm text-neutral-500">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
