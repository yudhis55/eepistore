import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  // Committed navy — primary structural action.
  primary:
    "bg-brand-navy-900 text-white hover:bg-brand-navy-700 focus-visible:outline-brand-navy-700",
  // Hairline outline — secondary, restrained.
  secondary:
    "border border-border bg-surface text-brand-navy-900 hover:bg-neutral-100 focus-visible:outline-brand-navy-700",
  // Transparent — tertiary / in-table actions.
  ghost: "text-neutral-700 hover:bg-neutral-100 focus-visible:outline-brand-navy-700",
  // Gold accent — ≤10% surface, single high-emphasis CTA per view.
  gold: "bg-brand-gold-500 text-brand-navy-900 hover:bg-brand-gold-300 focus-visible:outline-brand-gold-500",
  // Danger — destructive actions.
  danger: "bg-danger text-white hover:bg-danger/90 focus-visible:outline-danger",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-6 text-base",
};

/**
 * buttonVariants — the className string for a button style, so a Next <Link>
 * (or any anchor) can LOOK like a button without nesting an <a> inside a
 * <button> (which is invalid HTML). Usage:
 *   <Link className={buttonVariants({ variant: "primary" })} href="...">…
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
