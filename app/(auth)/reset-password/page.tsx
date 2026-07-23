"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction, type ResetPasswordState } from "@/features/auth/reset-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/input";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(
    resetPasswordAction,
    {},
  );

  if (state.success) {
    return (
      <Card className="space-y-4 p-6 text-center">
        <h1 className="text-h3">Password diperbarui</h1>
        <Link className="font-medium text-brand-navy-700 hover:underline" href="/login">
          Kembali ke halaman masuk
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form action={action} className="space-y-4">
        <h1 className="text-h3">Atur ulang password</h1>
        <input type="hidden" name="token" value={token} />
        <FormField label="Password baru" htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </FormField>
        <FormField label="Konfirmasi password" htmlFor="confirmPassword" required>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </FormField>
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        <Button type="submit" loading={pending} disabled={!token} className="w-full">
          Simpan password baru
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
