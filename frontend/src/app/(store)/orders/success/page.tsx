import type { Metadata } from "next";
import { OrderSuccessView } from "@/components/cart/OrderSuccessView";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.orderSuccess.title };

export default function OrderSuccessPage() {
  return <OrderSuccessView />;
}
