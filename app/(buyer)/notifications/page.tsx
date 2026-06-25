import { getNotifications } from "@/features/notification/actions";
import { MarkAllReadButton } from "@/components/mark-all-read-button";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
    <>
      <PageHeader
        title="Notifikasi"
        description="Riwayat pemberitahuan pesanan, pembayaran, dan akun Anda."
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="danger">
                <span className="font-mono tabular-nums">{unreadCount}</span> belum dibaca
              </Badge>
            )}
            {unreadCount > 0 && <MarkAllReadButton />}
          </div>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Pemberitahuan tentang pesanan, pembayaran, dan verifikasi Anda akan muncul di sini."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={notif.isRead ? "" : "border-brand-navy-700/30 bg-brand-navy-700/5"}
            >
              <CardBody className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-medium text-brand-navy-700">
                      {typeLabel[notif.type] ?? notif.type}
                    </span>
                    <p className="text-sm font-medium">{notif.title}</p>
                  </div>
                  {!notif.isRead && (
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-navy-900"
                      aria-label="Belum dibaca"
                    />
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(notif.createdAt).toLocaleString("id-ID")}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
