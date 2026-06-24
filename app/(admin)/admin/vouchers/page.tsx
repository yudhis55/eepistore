import { getAllVouchers, createVoucherAction } from "@/features/voucher/actions";
import { VoucherManager } from "@/components/voucher-manager";
import { VoucherForm } from "@/components/voucher-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Voucher — Admin",
};

export default async function AdminVouchersPage() {
  const vouchers = await getAllVouchers();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy-900">
        Kelola Voucher ({vouchers.length})
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold">Tambah Voucher</h2>
          <VoucherForm />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Daftar Voucher</h2>
          <VoucherManager vouchers={vouchers} />
        </div>
      </div>
    </main>
  );
}
