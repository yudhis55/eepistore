import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/cn";

const controlBase =
  "w-full min-h-11 rounded-md border border-input bg-surface px-3 text-sm text-foreground placeholder:text-neutral-500 outline-none transition-colors focus:border-brand-navy-700 focus:ring-2 focus:ring-brand-navy-700/30 disabled:cursor-not-allowed disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(controlBase, className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(controlBase, "min-h-24 py-2.5", className)} {...props} />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(controlBase, "pr-8", className)} {...props}>
        {children}
      </select>
    );
  },
);

/**
 * FormField — label + control + help text + error. Works with react-hook-form
 * via the forwarded ref on Input/Textarea/Select. Renders an error <p> with
 * role="alert" so screen readers announce it.
 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  help,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {help && !error && <p className="text-xs text-neutral-500">{help}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
