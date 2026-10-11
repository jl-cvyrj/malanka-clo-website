import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCategories } from "@/lib/api/public";
import type { Category } from "@/lib/api/types";

export const dynamic = "force-dynamic";

/**
 * Storefront shell: cart state + header/footer. Resilient to an unreachable
 * backend — navigation simply shows no categories.
 */
export default async function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <CartProvider>
      <Header categories={categories} />
      <main>{children}</main>
      <Footer categories={categories} />
    </CartProvider>
  );
}
