import { getNotifications } from "@/features/notification/actions";
import { MarkAllReadButton } from "@/components/mark-all-read-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifikasi — EEPISTORE",
};

const typeLabel: Record<string, string> = {
  NEW_ORDER: "Pesanan Baru",
  PAYMENT_PROOF_UPLOADED: "Bukti Pembayaran",
  PAYMENT_VERIFIED: "Pembayaran Terverifikasi",
  PAYMENT_REJECTED: "Pembayaran Ditolak",
  ORDER_STATUS_UPDATE: "Update Status Order",
  COD_RECEIVED: "COD Diterima",
  ORDER_COMPLETED: "Order Selesai",
  VERIFICATION_APPROVED: "Verifikasi Disetujui",
  VERIFICATION_REJECTED: "Verifikasi Ditolak",
  VERIFICATION_SUBMITTED: "Verifikasi Diajukan",
  NEW_MESSAGE: "Pesan Baru",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy-900">
          Notifikasi
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-danger px-2 py-0.5 text-sm text-white">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-border bg-neutral-100 p-12 text-center">
          <p className="text-neutral-500">Belum ada notifikasi.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border p-3 ${
                notif.isRead
                  ? "bg-surface-white border-border"
                  : "border-brand-navy-700/30 bg-brand-navy-700/5"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-brand-navy-700">
                    {typeLabel[notif.type] ?? notif.type}
                  </span>
                  <p className="text-sm font-medium">{notif.title}</p>
                </div>
                {!notif.isRead && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-navy-900" />
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {new Date(notif.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
