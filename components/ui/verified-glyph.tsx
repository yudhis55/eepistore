/**
 * VerifiedGlyph — the shared "verified mahasiswa PENS" mark. Gold burst with a
 * navy check. Never color alone: carries a title for screen readers. Used on
 * product cards and store cards wherever a verified seller is shown.
 */
export function VerifiedGlyph({ title, className }: { title: string; className?: string }) {
  return (
    <svg
      className={className ?? "h-4 w-4 shrink-0 text-brand-gold-500"}
      viewBox="0 0 24 24"
      fill="currentColor"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M12 1l2.4 2.1 3.1-.3 1.3 2.9 2.9 1.3-.3 3.1L23.4 12l-2.1 2.4.3 3.1-2.9 1.3-1.3 2.9-3.1-.3L12 23.4l-2.4-2.1-3.1.3-1.3-2.9-2.9-1.3.3-3.1L.6 12l2.1-2.4-.3-3.1 2.9-1.3 1.3-2.9 3.1.3L12 1z" />
      <path
        d="M8 12l2.5 2.5L16 9"
        fill="none"
        stroke="#0A2A5E"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
