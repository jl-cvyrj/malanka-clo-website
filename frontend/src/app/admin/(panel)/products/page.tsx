import type { Metadata } from "next";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.admin.nav.products };

export default function AdminProductsPage() {
  return <ProductsManager />;
}
