"use client";

import { useActionState, useState } from "react";
import {
  submitVerificationAction,
  type VerificationActionState,
} from "@/features/verification/actions";
import { FileUpload } from "@/components/ui/file-upload";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function VerificationForm() {
  const [state, formAction, pending] = useActionState<VerificationActionState, FormData>(
    submitVerificationAction,
    {},
  );
  const [ktmUrl, setKtmUrl] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="NIM" htmlFor="nim" required>
        <Input id="nim" name="nim" type="text" required placeholder="Contoh: 3122500001" />
      </FormField>

      <FileUpload
        folder="verifications"
        value={ktmUrl}
        onChange={(v) => setKtmUrl(typeof v === "string" ? v : (v[0] ?? ""))}
        label="Foto KTM"
        help="Foto KTM hanya dapat diakses Admin untuk verifikasi. Akses tercatat di audit log."
      />
      <input type="hidden" name="ktmImageUrl" value={ktmUrl} />

      {state.error && (
        <p
          role="alert"
          className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          Pengajuan terkirim. Menunggu review Admin.
        </p>
      )}

      <Button type="submit" loading={pending} disabled={!ktmUrl} className="w-full sm:w-auto">
        Ajukan Verifikasi
      </Button>
    </form>
  );
}
