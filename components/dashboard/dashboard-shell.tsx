"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Role = "SELLER" | "ADMIN";

type NavItem = { label: string; href: string; icon: ReactNode };

const SELLER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <GridIcon /> },
  { label: "Pesanan", href: "/dashboard/orders", icon: <CartIcon /> },
  { label: "Produk", href: "/dashboard/products/new", icon: <BoxIcon /> },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <GridIcon /> },
  { label: "Produk", href: "/admin/products", icon: <BoxIcon /> },
  { label: "Pesanan", href: "/admin/orders", icon: <CartIcon /> },
  { label: "User", href: "/admin/users", icon: <UsersIcon /> },
  { label: "Toko", href: "/admin/stores", icon: <StoreIcon /> },
  { label: "Kategori", href: "/admin/categories", icon: <TagIcon /> },
  { label: "Verifikasi", href: "/admin/verifications", icon: <ShieldIcon /> },
  { label: "Voucher", href: "/admin/vouchers", icon: <TicketIcon /> },
  { label: "Banner", href: "/admin/banners", icon: <ImageIcon /> },
  { label: "Laporan", href: "/admin/reports", icon: <ChartIcon /> },
];

/**
 * DashboardShell — the app chrome for seller + admin. White hairline sidebar
 * (density/data, long sessions) + navy brand anchor in the sidebar header.
 * Page-level title/description/actions are rendered by <PageHeader> inside
 * the page, NOT here — so each page owns its own header.
 */
export function DashboardShell({ role, children }: { role: Role; children: ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = role === "ADMIN" ? ADMIN_NAV : SELLER_NAV;
  const roleLabel = role === "ADMIN" ? "Admin" : "Penjual";

  return (
    <div className="min-h-screen bg-neutral-50">
      <a
        href="#eepi-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-tooltip focus:rounded-md focus:bg-brand-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Lewati ke konten
      </a>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-dropdown w-64 border-r border-border bg-surface transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-5">
          <Link href="/" className="text-base font-bold text-brand-navy-900">
            EEPISTORE
          </Link>
          <span className="rounded-sm bg-brand-navy-900/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-navy-900">
            {roleLabel}
          </span>
        </div>

        <nav className="flex flex-col gap-0.5 p-3" aria-label={`${roleLabel} navigation`}>
          {nav.map((item) => {
            const isProductsParent =
              item.href === "/dashboard/products/new" && pathname.startsWith("/dashboard/products");
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const isActive = active || isProductsParent;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-navy-900/5 text-brand-navy-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-brand-navy-900",
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-brand-navy-900"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "shrink-0",
                    isActive
                      ? "text-brand-navy-900"
                      : "text-neutral-400 group-hover:text-brand-navy-700",
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-border p-3">
          {session?.user && (
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy-900 text-xs font-semibold text-white">
                {(session.user.name ?? "?").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">{session.user.name}</p>
                <p className="truncate text-xs text-neutral-500">{roleLabel}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-sticky bg-brand-navy-900/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-sticky flex h-14 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
            aria-label="Buka menu"
          >
            <MenuIcon />
          </button>
          <span className="font-bold text-brand-navy-900">EEPISTORE</span>
        </header>

        <main id="eepi-main" className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function iconBase(path: ReactNode) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden
    >
      {path}
    </svg>
  );
}
function GridIcon() {
  return iconBase(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.5 3.5h7v7h-7zM13.5 3.5h7v7h-7zM3.5 13.5h7v7h-7zM13.5 13.5h7v7h-7z"
    />,
  );
}
function CartIcon() {
  return iconBase(
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 3h2.5l2.2 12.4a1.5 1.5 0 001.48 1.21h9.1a1.5 1.5 0 001.47-1.18L21 7H5.2"
      />
    </>,
  );
}
function BoxIcon() {
  return iconBase(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7l9-4 9 4v10l-9 4-9-4V7zM3 7l9 4M21 7l-9 4M12 11v10"
    />,
  );
}
function UsersIcon() {
  return iconBase(
    <>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path strokeLinecap="round" d="M16 5.5a3 3 0 010 5M21 20c0-2.5-1.4-4.6-3.5-5.6" />
    </>,
  );
}
function StoreIcon() {
  return iconBase(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9l1.5-5h15L21 9M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 20v-5h6v5"
    />,
  );
}
function TagIcon() {
  return iconBase(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12V4a1 1 0 011-1h8l9 9-9 9-9-9zM7.5 7.5h.01"
    />,
  );
}
function ShieldIcon() {
  return iconBase(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2l8 3v6c0 4.5-3.2 8.5-8 10-4.8-1.5-8-5.5-8-10V5l8-3z"
    />,
  );
}
function TicketIcon() {
  return iconBase(
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8a2 2 0 012-2h14a2 2 0 012 2 2 2 0 000 4 2 2 0 000 4 2 2 0 01-2 2H5a2 2 0 01-2-2 2 2 0 000-4 2 2 0 000-4z"
    />,
  );
}
function ImageIcon() {
  return iconBase(
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
    </>,
  );
}
function ChartIcon() {
  return iconBase(
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 14l3-3 3 2 5-6" />,
  );
}
function MenuIcon() {
  return iconBase(<path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />);
}
