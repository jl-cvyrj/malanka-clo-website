/**
 * Types mirroring the backend REST contract (see backend/README.md and the
 * `*Response`/`*Request` records in `backend/src/main/java`).
 *
 * Nothing here depends on Spring — these are deliberately hand-written so the
 * frontend stays decoupled from server internals.
 */

export type OrderType = "DOMESTIC" | "INTERNATIONAL";

export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "READY"
  | "SENT"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export type DeliveryMethod = "BELPOST" | "EUROPOST" | "MANAGER";

export type PaymentMethod =
  | "FULL_PREPAYMENT"
  | "PARTIAL_PREPAYMENT"
  | "PAY_ON_RECEIPT";

/** Query values accepted by `GET /api/products` (lower-case in the URL). */
export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  active: boolean;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  price: number;
  currency: string;
  categoryName: string;
  categorySlug: string;
  primaryImageUrl: string | null;
  availableSizes: string[];
  active: boolean;
}

export interface ProductImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductSize {
  id: number;
  sizeCode: string;
  available: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  categoryName: string;
  categorySlug: string;
  active: boolean;
  images: ProductImage[];
  sizes: ProductSize[];
}

export interface OrderItem {
  productName: string;
  sizeCode: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
  phone: string;
  email: string | null;
  telegramUsername: string | null;
  postalIndex: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  deliveryMethod: DeliveryMethod | null;
  paymentMethod: PaymentMethod | null;
  subtotalAmount: number | null;
  shippingAmount: number | null;
  totalAmount: number | null;
  currency: string;
  comment: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number | null;
  currency: string;
  createdAt: string;
  itemCount: number;
}

/** Stable pagination envelope returned by list endpoints. */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Consistent error payload (`common/web/ApiError`). */
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

export interface AdminSession {
  username: string;
  roles: string[];
}

/* ------------------------------------------------------------------ */
/* Request payloads                                                    */
/* ------------------------------------------------------------------ */

export interface CreateOrderItemPayload {
  productId: number;
  sizeCode: string;
  quantity: number;
}

export interface CreateOrderPayload {
  type: OrderType;
  customerName: string;
  phone: string;
  email?: string;
  telegramUsername?: string;
  postalIndex?: string;
  country?: string;
  city?: string;
  address?: string;
  deliveryMethod?: DeliveryMethod;
  paymentMethod?: PaymentMethod;
  comment?: string;
  items: CreateOrderItemPayload[];
}

export interface CategoryPayload {
  name: string;
  slug: string;
  sortOrder: number;
}

export interface ProductPayload {
  categoryId: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
}

export interface ProductImagePayload {
  url: string;
  altText?: string;
  sortOrder?: number;
}
