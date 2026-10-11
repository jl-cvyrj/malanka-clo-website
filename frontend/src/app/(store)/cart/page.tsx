import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.cart.title };

export default function CartPage() {
  return <CartView />;
}
