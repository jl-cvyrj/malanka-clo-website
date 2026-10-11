import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.admin.products.edit };

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number.parseInt(id, 10);
  if (!Number.isFinite(productId)) notFound();

  return <ProductForm productId={productId} />;
}
