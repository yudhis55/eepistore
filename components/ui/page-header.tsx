import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * PageHeader — title + description + actions + optional breadcrumb slot.
 * The consistent top of every dashboard/app page.
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumb && <nav className="mb-2">{breadcrumb}</nav>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-h2 text-brand-navy-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** Breadcrumb — hairline-separated, last item is current (no link). */
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <li key={i} className="flex items-center gap-1.5">
            {item.href && !last ? (
              <a href={item.href} className="hover:text-brand-navy-700">
                {item.label}
              </a>
            ) : (
              <span className={last ? "font-medium text-foreground" : ""}>{item.label}</span>
            )}
            {!last && (
              <span className="text-neutral-300" aria-hidden>
                /
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
