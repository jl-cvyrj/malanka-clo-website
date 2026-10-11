import type { Metadata } from "next";
import { DashboardView } from "@/components/admin/DashboardView";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.admin.nav.dashboard };

export default function AdminDashboardPage() {
  return <DashboardView />;
}
