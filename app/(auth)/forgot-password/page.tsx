"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ResetRequestState } from "@/features/auth/reset-actions";
import { Card } from "@/components/ui/card";
import { Input, FormField } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ResetRequestState, FormData>(
    requestPasswordResetAction,
    {},
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h2 text-brand-navy-900">Lupa Password</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Masukkan email Anda untuk menerima tautan reset password
        </p>
      </div>

      <Card className="p-6">
        {state.success ? (
          <div className="space-y-4">
            <p className="rounded-md bg-success/10 px-4 py-3 text-sm text-success">
              Jika email terdaftar, tautan reset password telah dikirim ke email Anda.
            </p>
            <Link href="/login" className={`${buttonVariants({ variant: "secondary" })} w-full`}>
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <FormField label="Email" htmlFor="email" required>
              <Input id="email" name="email" type="email" required autoComplete="email" />
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
              Kirim Tautan Reset
            </Button>
          </form>
        )}
      </Card>

      <p className="text-center text-sm text-neutral-500">
        Ingat password?{" "}
        <Link href="/login" className="font-medium text-brand-navy-700 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
