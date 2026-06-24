type OrderStatusBadgeProps = {
  status: string;
  label: string;
};

const statusColors: Record<string, string> = {
  MENUNGGU_PEMBAYARAN: "bg-warning/20 text-warning",
  MENUNGGU_KONFIRMASI: "bg-warning/20 text-warning",
  DIPROSES: "bg-brand-navy-700/20 text-brand-navy-700",
  SIAP_DIAMBIL: "bg-brand-gold-500/20 text-brand-gold-500",
  SELESAI: "bg-success/20 text-success",
  DIBATALKAN: "bg-danger/20 text-danger",
};

export function OrderStatusBadge({ status, label }: OrderStatusBadgeProps) {
  const colorClass = statusColors[status] ?? "bg-neutral-100 text-neutral-500";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${colorClass}`}>{label}</span>;
}
