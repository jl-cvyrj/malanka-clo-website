import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Never index the admin panel.
  robots: { index: false, follow: false },
};

/** Guarded admin panel. `AdminShell` redirects to /admin/login on 401. */
export default function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminShell>{children}</AdminShell>;
}
