"use client";

import { useActionState } from "react";
import { createVoucherAction, type VoucherActionState } from "@/features/voucher/actions";
import { Input, Select, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function VoucherForm() {
  const [state, formAction, pending] = useActionState<VoucherActionState, FormData>(
    createVoucherAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <FormField label="Kode Voucher" htmlFor="code" required>
        <Input
          id="code"
          name="code"
          type="text"
          required
          placeholder="HEMAT10"
          className="uppercase"
        />
      </FormField>

      <FormField label="Tipe Diskon" htmlFor="discountType">
        <Select id="discountType" name="discountType" defaultValue="PERCENTAGE">
          <option value="PERCENTAGE">Persentase (%)</option>
          <option value="NOMINAL">Nominal (IDR)</option>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Nilai" htmlFor="value" required>
          <Input id="value" name="value" type="number" min="0" required />
        </FormField>
        <FormField label="Max Discount" htmlFor="maxDiscount">
          <Input id="maxDiscount" name="maxDiscount" type="number" min="0" placeholder="Opsional" />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Min Purchase" htmlFor="minPurchase">
          <Input id="minPurchase" name="minPurchase" type="number" min="0" defaultValue={0} />
        </FormField>
        <FormField label="Kuota" htmlFor="quota">
          <Input id="quota" name="quota" type="number" min="0" defaultValue={0} />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Berlaku Dari" htmlFor="validFrom" required>
          <Input id="validFrom" name="validFrom" type="datetime-local" required />
        </FormField>
        <FormField label="Berlaku Sampai" htmlFor="validUntil" required>
          <Input id="validUntil" name="validUntil" type="datetime-local" required />
        </FormField>
      </div>

      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          value="true"
          defaultChecked
          className="h-4 w-4 rounded border-border accent-brand-navy-900"
        />
        Aktif
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">Voucher dibuat.</p>
      )}

      <Button type="submit" loading={pending} className="w-full sm:w-auto">
        Simpan Voucher
      </Button>
    </form>
  );
}
