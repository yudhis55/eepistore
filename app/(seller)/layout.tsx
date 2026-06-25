import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return <DashboardShell role="SELLER">{children}</DashboardShell>;
}
