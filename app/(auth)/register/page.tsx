"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterState } from "@/features/auth/actions";
import { Card } from "@/components/ui/card";
import { Input, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(registerAction, {});

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-h2 text-brand-navy-900">Daftar</h1>
        <p className="mt-1 text-sm text-neutral-500">Buat akun EEPISTORE baru</p>
      </div>

      <Card className="p-6">
        <form action={formAction} className="space-y-4">
          <FormField label="Nama" htmlFor="name" required>
            <Input id="name" name="name" type="text" required autoComplete="name" />
          </FormField>

          <FormField label="Email" htmlFor="email" required>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            required
            help="Minimal 8 karakter, harus mengandung huruf dan angka"
          >
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
          </FormField>

          <FormField label="Konfirmasi Password" htmlFor="confirmPassword" required>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
            />
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
            Daftar
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-neutral-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-brand-navy-700 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
