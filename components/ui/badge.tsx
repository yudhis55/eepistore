import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info" | "gold";

/**
 * Badge — semantic pill. Always color + label; pass an icon for colorblind
 * safety (color must never be the sole signal). Ink-on-tint, never tint-on-white
 * at body size, to keep AA contrast.
 */
const variants: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-900",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-amber-900",
  danger: "bg-danger/15 text-danger",
  info: "bg-brand-navy-900/10 text-brand-navy-900",
  gold: "bg-brand-gold-500/20 text-amber-900",
};

export function Badge({
  variant = "neutral",
  icon,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
