import type { Metadata } from "next";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.admin.nav.orders };

export default function AdminOrdersPage() {
  return <OrdersManager />;
}
