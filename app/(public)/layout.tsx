import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#eepi-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-tooltip focus:rounded-md focus:bg-brand-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Lewati ke konten
      </a>
      <Navbar />
      <main id="eepi-main">{children}</main>
    </div>
  );
}
