import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.admin.products.new };

export default function AdminNewProductPage() {
  return <ProductForm />;
}
