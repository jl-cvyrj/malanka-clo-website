import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/admin/OrderDetailView";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.admin.orders.detailTitle };

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number.parseInt(id, 10);
  if (!Number.isFinite(orderId)) notFound();

  return <OrderDetailView orderId={orderId} />;
}
