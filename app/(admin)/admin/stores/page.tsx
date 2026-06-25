import { prisma } from "@/lib/prisma";
import { StoreActions } from "@/components/store-actions";
import { PageHeader } from "@/components/ui/page-header";
import { Table, THead, TBody, TR, TH, TD, TableWrapper } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Toko — Admin EEPISTORE",
};

const storeStatus: Record<
  string,
  { variant: "success" | "warning" | "danger" | "neutral"; label: string }
> = {
  APPROVED: { variant: "success", label: "Disetujui" },
  PENDING: { variant: "warning", label: "Menunggu" },
  REJECTED: { variant: "danger", label: "Ditolak" },
  SUSPENDED: { variant: "danger", label: "Ditangguhkan" },
  ACTIVE: { variant: "success", label: "Aktif" },
};

export default async function AdminStoresPage() {
  const stores = await prisma.storeProfile.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Kelola Toko"
        description={`Verifikasi dan kelola profil toko penjual · ${stores.length} toko`}
      />

      {stores.length === 0 ? (
        <EmptyState
          title="Belum ada toko"
          description="Permohonan pendaftaran toko dari penjual akan tampil di sini untuk diverifikasi."
          action={
            <Link href="/admin" className={buttonVariants({ variant: "secondary", size: "sm" })}>
              Kembali ke Dasbor
            </Link>
          }
        />
      ) : (
        <TableWrapper>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Toko</TH>
                  <TH>Pemilik</TH>
                  <TH>Status</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {stores.map((store) => {
                  const s = storeStatus[store.status] ?? {
                    variant: "neutral" as const,
                    label: store.status,
                  };
                  return (
                    <TR key={store.id}>
                      <TD>
                        <p className="font-medium">{store.storeName}</p>
                        {store.description && (
                          <p className="line-clamp-1 text-xs text-neutral-500">
                            {store.description}
                          </p>
                        )}
                      </TD>
                      <TD className="text-neutral-500">
                        {store.user.name}
                        <br />
                        <span className="text-xs">{store.user.email}</span>
                      </TD>
                      <TD>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TD>
                      <TD>{store.status === "PENDING" && <StoreActions storeId={store.id} />}</TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        </TableWrapper>
      )}
    </>
  );
}
