import Link from "next/link";
import Image from "next/image";
import { VerifiedGlyph } from "@/components/ui/verified-glyph";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  condition: string;
  imageUrl?: string;
  storeName: string;
  isVerified?: boolean;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export function ProductCard({
  id,
  name,
  price,
  condition,
  imageUrl,
  storeName,
  isVerified,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700"
    >
      <div className="relative aspect-square bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 19.25h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        )}
        {condition === "PRELOVED" && (
          // Navy ink on warning fill — AA safe (white-on-warning was ~2.3:1).
          <span className="absolute left-2 top-2 rounded-sm bg-warning px-2 py-0.5 text-xs font-semibold text-brand-navy-900">
            Preloved
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-900 group-hover:text-brand-navy-700">
          {name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
          <span className="truncate">{storeName}</span>
          {isVerified && (
            <VerifiedGlyph title="Toko terverifikasi mahasiswa PENS" className="h-3.5 w-3.5" />
          )}
        </div>
        <p className="mt-2 font-mono text-base font-bold tabular-nums text-brand-navy-900">
          {formatPrice(price)}
        </p>
      </div>
    </Link>
  );
}
