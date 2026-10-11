import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { t } from "@/locales";

export const metadata: Metadata = { title: t.checkout.title };

export default function CheckoutPage() {
  return <CheckoutForm />;
}
