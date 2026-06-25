"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { SearchBar } from "@/components/search-bar";
import { cn } from "@/lib/cn";

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close avatar menu on outside click / Escape (keyboard nav).
  useEffect(() => {
    if (!menuOpen) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isSellerOrAdmin = session?.user?.role === "SELLER" || session?.user?.role === "ADMIN";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-sticky border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-lg font-bold text-brand-navy-900">
          EEPISTORE
        </Link>

        {/* Desktop search (inline, grows) */}
        <div className="hidden flex-1 md:block md:max-w-md">
          <SearchBar />
        </div>

        <nav className="ml-auto flex items-center gap-1" aria-label="Utama">
          <Link
            href="/products"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy-900 sm:block"
          >
            Produk
          </Link>

          {/* Mobile search toggle */}
          <IconButton label="Cari" onClick={() => setMobileSearch((v) => !v)} className="md:hidden">
            <SearchIcon />
          </IconButton>

          {status === "loading" ? null : session ? (
            <>
              {/* Cart */}
              <IconLink href="/cart" label="Keranjang">
                <CartIcon />
              </IconLink>

              {/* Chat */}
              <IconLink href="/chat" label="Pesan">
                <ChatIcon />
              </IconLink>

              {/* Notifications */}
              <IconLink href="/notifications" label="Notifikasi">
                <BellIcon />
              </IconLink>

              {/* Avatar menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy-900 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700"
                >
                  {session.user?.name?.[0] ?? "U"}
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-11 z-dropdown w-56 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg"
                  >
                    <div className="border-b border-border px-4 py-2.5">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {session.user?.name}
                      </p>
                      <p className="truncate text-xs text-neutral-500">{session.user?.email}</p>
                    </div>
                    <MenuLink href="/orders" onClick={() => setMenuOpen(false)}>
                      Pesanan Saya
                    </MenuLink>
                    <MenuLink href="/wishlist" onClick={() => setMenuOpen(false)}>
                      Wishlist
                    </MenuLink>
                    <MenuLink href="/profile" onClick={() => setMenuOpen(false)}>
                      Profil
                    </MenuLink>
                    {isSellerOrAdmin && (
                      <MenuLink href="/dashboard" onClick={() => setMenuOpen(false)}>
                        Dashboard Penjual
                      </MenuLink>
                    )}
                    {isAdmin && (
                      <MenuLink href="/admin" onClick={() => setMenuOpen(false)}>
                        Admin
                      </MenuLink>
                    )}
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full px-4 py-2 text-left text-sm font-medium text-danger hover:bg-danger/10"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy-900"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-brand-navy-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-700"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile search drawer */}
      {mobileSearch && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <SearchBar />
        </div>
      )}
    </header>
  );
}

function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700",
        className,
      )}
    >
      {children}
    </button>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-700"
    >
      {children}
    </Link>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-brand-navy-900"
    >
      {children}
    </Link>
  );
}

// --- Icons, 1.5px stroke ---
function SearchIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 3h2.5l2.2 12.4a1.5 1.5 0 001.48 1.21h9.1a1.5 1.5 0 001.47-1.18L21 7H5.2"
      />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 01-9 8.32L3 21l1.18-6A8.5 8.5 0 1121 11.5z"
      />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
      />
    </svg>
  );
}
