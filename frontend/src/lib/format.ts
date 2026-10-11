import { t } from "@/locales";
import type {
  DeliveryMethod,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  ProductSort,
} from "./api/types";

const numberFormat = new Intl.NumberFormat("be-BY", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** `140 → "140,00 BYN"`, `45.5 → "45,50 BYN"`. */
export function formatPrice(
  value: number | null | undefined,
  currency = "BYN",
): string {
  if (value === null || value === undefined) return "—";
  const amount = numberFormat.format(value);
  return currency ? `${amount} ${currency}` : amount;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("be-BY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const orderTypeLabel = (value: OrderType): string =>
  t.enums.orderType[value];

export const orderStatusLabel = (value: OrderStatus): string =>
  t.enums.orderStatus[value];

export const paymentStatusLabel = (value: PaymentStatus): string =>
  t.enums.paymentStatus[value];

export const deliveryMethodLabel = (value: DeliveryMethod | null): string =>
  value ? t.enums.deliveryMethod[value] : "—";

export const paymentMethodLabel = (value: PaymentMethod | null): string =>
  value ? t.enums.paymentMethod[value] : "—";

export const productSortLabel = (value: ProductSort): string =>
  t.enums.productSort[value];

export const ORDER_STATUSES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "IN_PRODUCTION",
  "READY",
  "SENT",
  "COMPLETED",
  "CANCELLED",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
];

export const ORDER_TYPES: OrderType[] = ["DOMESTIC", "INTERNATIONAL"];

export const DELIVERY_METHODS: DeliveryMethod[] = [
  "BELPOST",
  "EUROPOST",
  "MANAGER",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  "FULL_PREPAYMENT",
  "PARTIAL_PREPAYMENT",
  "PAY_ON_RECEIPT",
];

export const PRODUCT_SORTS: ProductSort[] = [
  "newest",
  "price_asc",
  "price_desc",
  "name_asc",
];
