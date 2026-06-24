"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type RegisterState } from "@/features/auth/actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(registerAction, {});

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-navy-900">Daftar</h1>
          <p className="mt-1 text-sm text-neutral-500">Buat akun EEPISTORE baru</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nama
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
            />
          </div>

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

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-navy-700"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Minimal 8 karakter, harus mengandung huruf dan angka
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
              Konfirmasi Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
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
            {pending ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-brand-navy-700 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
