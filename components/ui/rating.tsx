import { cn } from "@/lib/cn";

/**
 * RatingStars — colorblind-safe rating display. Stars are a solid fill (not
 * gold-on-white text, which fails AA at small sizes). A numeric label always
 * accompanies the stars so the rating is legible without color. Uses an SVG
 * mask so partial ratings (3.5) render a half star.
 */
export function RatingStars({
  value,
  count,
  size = "sm",
  showValue = true,
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(5, value)) / 5;
  const star = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const label = value.toFixed(1);

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative inline-flex" role="img" aria-label={`Rating ${label} dari 5`}>
        {/* Empty track */}
        <span className={cn("inline-flex text-neutral-300", star)}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-full w-full" />
          ))}
        </span>
        {/* Filled overlay, clipped to the percentage */}
        <span
          className="absolute inset-0 inline-flex overflow-hidden text-brand-gold-500"
          style={{ width: `${pct * 100}%` }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-full w-full shrink-0" />
          ))}
        </span>
      </span>
      {showValue && (
        <span className="text-xs font-medium tabular-nums text-neutral-700">{label}</span>
      )}
      {typeof count === "number" && <span className="text-xs text-neutral-500">({count})</span>}
    </span>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l2.9 6.26L21.8 9.27l-5 4.87 1.18 6.88L12 17.77l-6.98 3.25L6.2 14.14l-5-4.87 6.9-1.01L12 2z" />
    </svg>
  );
}
