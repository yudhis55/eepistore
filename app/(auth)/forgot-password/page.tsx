"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ResetRequestState } from "@/features/auth/reset-actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<ResetRequestState, FormData>(
    requestPasswordResetAction,
    {},
  );

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-navy-900">Lupa Password</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Masukkan email Anda untuk menerima tautan reset password
          </p>
        </div>

        {state.success ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              Jika email terdaftar, tautan reset password telah dikirim ke email Anda.
            </p>
            <Link
              href="/login"
              className="block text-center text-sm font-medium text-brand-navy-700 hover:underline"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
              />
            </div>

            {state.error && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand-navy-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-brand-navy-700 disabled:opacity-50"
            >
              {pending ? "Memproses..." : "Kirim Tautan Reset"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-neutral-500">
          Ingat password?{" "}
          <Link href="/login" className="font-medium text-brand-navy-700 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
