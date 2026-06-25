import type { ReactNode } from "react";
import { StatusPill } from "@/components/ui/status-pill";

type OrderStatusBadgeProps = {
  status: string;
  label: string;
};

// Each status pairs a color tone WITH an icon — color is never the sole signal
// (colorblind-safe). Ink colors are the darker shades that hold AA at 12px.
const STATUS_MAP: Record<
  string,
  { tone: "warning" | "info" | "gold" | "success" | "danger" | "neutral"; icon: ReactNode }
> = {
  MENUNGGU_PEMBAYARAN: {
    tone: "warning",
    icon: <DotIcon />,
  },
  MENUNGGU_KONFIRMASI: {
    tone: "warning",
    icon: <ClockIcon />,
  },
  DIPROSES: {
    tone: "info",
    icon: <GearIcon />,
  },
  SIAP_DIAMBIL: {
    tone: "gold",
    icon: <BoxIcon />,
  },
  SELESAI: {
    tone: "success",
    icon: <CheckIcon />,
  },
  DIBATALKAN: {
    tone: "danger",
    icon: <XIcon />,
  },
};

export function OrderStatusBadge({ status, label }: OrderStatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { tone: "neutral" as const, icon: <DotIcon /> };
  return (
    <StatusPill tone={config.tone} icon={config.icon}>
      {label}
    </StatusPill>
  );
}

// --- Inline status icons, 1.5px stroke, consistent with the engineered set ---
function DotIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"
      />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4z" />
      <path strokeLinejoin="round" d="M3 7v10l9 4 9-4V7" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
