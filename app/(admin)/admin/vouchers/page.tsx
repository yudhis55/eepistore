import { getAllVouchers } from "@/features/voucher/actions";
import { VoucherManager } from "@/components/voucher-manager";
import { VoucherForm } from "@/components/voucher-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Voucher — Admin",
};

export default async function AdminVouchersPage() {
  const vouchers = await getAllVouchers();

  return (
    <>
      <PageHeader
        title="Kelola Voucher"
        description={`Buat dan kelola kode promo — ${vouchers.length} voucher`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-brand-navy-900">Tambah Voucher</h2>
          </CardHeader>
          <CardBody>
            <VoucherForm />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-brand-navy-900">Daftar Voucher</h2>
          </CardHeader>
          <CardBody>
            <VoucherManager vouchers={vouchers} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
