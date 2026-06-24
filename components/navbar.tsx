"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-surface-white/95 sticky top-0 z-50 border-b border-border backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-navy-900">EEPISTORE</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/products"
            className="hidden text-neutral-500 hover:text-brand-navy-900 sm:block"
          >
            Produk
          </Link>

          {status === "loading" ? null : session ? (
            <>
              <Link href="/cart" className="text-neutral-500 hover:text-brand-navy-900">
                Keranjang
              </Link>

              {session.user.role === "SELLER" || session.user.role === "ADMIN" ? (
                <Link
                  href="/dashboard"
                  className="hidden text-neutral-500 hover:text-brand-navy-900 sm:block"
                >
                  Dashboard
                </Link>
              ) : null}

              {session.user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="hidden text-neutral-500 hover:text-brand-navy-900 sm:block"
                >
                  Admin
                </Link>
              ) : null}

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy-900 text-xs font-medium text-white"
                >
                  {session.user.name?.[0] ?? "U"}
                </button>

                {menuOpen && (
                  <div className="bg-surface-white absolute right-0 top-10 w-48 rounded-lg border border-border py-2 shadow-lg">
                    <div className="border-b border-border px-4 py-2">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-neutral-500">{session.user.email}</p>
                    </div>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm hover:bg-neutral-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Pesanan Saya
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm hover:bg-neutral-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profil
                    </Link>
                    {session.user.role === "SELLER" || session.user.role === "ADMIN" ? (
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm hover:bg-neutral-100 sm:hidden"
                        onClick={() => setMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    ) : null}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/10"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-neutral-500 hover:text-brand-navy-900">
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-navy-900 px-3 py-1.5 font-medium text-white hover:bg-brand-navy-700"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
