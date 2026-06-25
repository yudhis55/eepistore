"use client";

import { useActionState } from "react";
import { applyStoreAction, type StoreActionState } from "@/features/store/actions";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function StoreOnboardingForm() {
  const [state, formAction, pending] = useActionState<StoreActionState, FormData>(
    applyStoreAction,
    {},
  );

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <FormField label="Nama Toko" htmlFor="storeName" required>
        <Input
          id="storeName"
          name="storeName"
          type="text"
          required
          placeholder="cth. Rizki Electronics"
        />
      </FormField>

      <FormField label="Deskripsi Toko (opsional)" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Jualan apa? Cth: komponen praktikum & Arduino bekas."
        />
      </FormField>

      <FormField
        label="Lokasi COD/Pengambilan (opsional)"
        htmlFor="pickupLocation"
        help="Tempat temu di kampus, cth: Depan Gedung PSDKU"
      >
        <Input id="pickupLocation" name="pickupLocation" type="text" />
      </FormField>

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Mengirim…" : "Ajukan Toko"}
      </Button>
    </form>
  );
}
