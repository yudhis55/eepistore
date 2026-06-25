import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <a
        href="#eepi-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-tooltip focus:rounded-md focus:bg-brand-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Lewati ke konten
      </a>
      {/* Brand anchor — navy band at the top, no full navbar. */}
      <header className="border-b border-border bg-brand-navy-900">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="text-base font-bold text-white">
            EEPISTORE
          </Link>
        </div>
      </header>
      <main id="eepi-main" className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
