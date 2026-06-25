import { cn } from "@/lib/cn";

/**
 * Skeleton — shimmer placeholder for loading. Use in place of spinners-in-content.
 * Reduced-motion is handled globally (shimmer becomes a static flat block).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-neutral-200/70", className)} aria-hidden />
  );
}

/** A grid of product-card skeletons for catalog/landing loading. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
