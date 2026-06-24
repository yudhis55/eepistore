import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
  id: string;
  name: string;
  price: number;
  condition: string;
  imageUrl?: string;
  storeName: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export function ProductCard({ id, name, price, condition, imageUrl, storeName }: ProductCardProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="bg-surface-white group flex flex-col overflow-hidden rounded-lg border border-border transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">
            <span className="text-xs">No image</span>
          </div>
        )}
        {condition === "PRELOVED" && (
          <span className="absolute left-2 top-2 rounded bg-warning px-2 py-0.5 text-xs font-medium text-white">
            Preloved
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-900 group-hover:text-brand-navy-700">
          {name}
        </h3>
        <p className="mt-1 text-xs text-neutral-500">{storeName}</p>
        <p className="mt-2 text-base font-bold text-brand-navy-900">{formatPrice(price)}</p>
      </div>
    </Link>
  );
}
