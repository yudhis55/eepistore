import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";

/**
 * StatCard — a single dashboard metric. Mono tabular numerics, hairline Card,
 * optional link to a detail page. Never the SaaS hero-metric template (no
 * gradient, no supporting-stats flourish) — just a clean labeled number.
 */
export function StatCard({
  label,
  value,
  href,
  icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string;
  href?: string;
  icon?: ReactNode;
  tone?: "neutral" | "gold" | "success" | "warning" | "danger";
  className?: string;
}) {
  const content = (
    <Card className={cn("p-4 transition-colors", href && "hover:bg-neutral-50", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        {icon && <span className="text-neutral-400">{icon}</span>}
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-2xl font-bold tabular-nums",
          tone === "neutral" && "text-brand-navy-900",
          tone === "gold" && "text-amber-700",
          tone === "success" && "text-success",
          tone === "warning" && "text-amber-700",
          tone === "danger" && "text-danger",
        )}
      >
        {value}
      </p>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700"
      >
        {content}
      </Link>
    );
  }
  return content;
}
