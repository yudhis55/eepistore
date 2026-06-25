import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Card — surface + hairline border by default. Shadow is OPT-IN via the
 * `elevated` prop (reserved for floating elements: dropdowns, modals, sticky
 * bars). Static content uses the hairline, not a drop shadow.
 */
export function Card({
  className,
  elevated = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { elevated?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface",
        elevated && "shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border px-4 py-3", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}
