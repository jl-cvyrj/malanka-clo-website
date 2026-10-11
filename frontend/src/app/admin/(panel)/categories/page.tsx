import type { Metadata } from "next";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.admin.nav.categories };

export default function AdminCategoriesPage() {
  return <CategoriesManager />;
}
