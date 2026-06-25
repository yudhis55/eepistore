import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * EmptyState — never a dead end. Icon + title + description + a primary CTA
 * (and optional secondary). Used everywhere a list/grid/table can be empty.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-border bg-neutral-100/50 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy-900/10 text-brand-navy-900">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-brand-navy-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
}
