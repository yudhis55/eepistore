/**
 * Tiny className combiner — no clsx/tailwind-merge dependency.
 * Accepts strings, falsy values, and arrays; joins truthy ones with spaces.
 * Good enough for variant composition without adding a dep surface.
 */
export type ClassValue = string | false | null | undefined | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const v of inputs) {
    if (!v) continue;
    if (Array.isArray(v)) {
      const inner = cn(...v);
      if (inner) out.push(inner);
    } else {
      out.push(v);
    }
  }
  return out.join(" ");
}
