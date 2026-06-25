import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatusTone = "neutral" | "info" | "warning" | "gold" | "success" | "danger";

const tones: Record<StatusTone, string> = {
  neutral: "bg-neutral-100 text-neutral-900 ring-neutral-200",
  info: "bg-brand-navy-900/10 text-brand-navy-900 ring-brand-navy-900/20",
  warning: "bg-warning/20 text-amber-900 ring-warning/40",
  gold: "bg-brand-gold-500/20 text-amber-900 ring-brand-gold-500/40",
  success: "bg-success/15 text-success ring-success/30",
  danger: "bg-danger/15 text-danger ring-danger/30",
};

/**
 * StatusPill — color + icon + label, colorblind-safe. Always carries an icon
 * so the status is legible without color. 1px ring for the "engineered" edge.
 */
export function StatusPill({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: StatusTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
