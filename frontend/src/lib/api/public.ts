import { apiRequest } from "./client";
import type {
  Category,
  CreateOrderPayload,
  Order,
  PageResponse,
  ProductDetail,
  ProductSort,
  ProductSummary,
} from "./types";

/** Public, unauthenticated storefront endpoints. */

export function getCategories(signal?: AbortSignal): Promise<Category[]> {
  return apiRequest<Category[]>("/api/categories", { signal });
}

export interface ProductQuery {
  category?: string;
  sort?: ProductSort;
  page?: number;
  size?: number;
}

export function getProducts(
  query: ProductQuery = {},
  signal?: AbortSignal,
): Promise<PageResponse<ProductSummary>> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.sort) params.set("sort", query.sort);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const qs = params.toString();
  return apiRequest<PageResponse<ProductSummary>>(
    `/api/products${qs ? `?${qs}` : ""}`,
    { signal },
  );
}

export function getProduct(
  slug: string,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`, {
    signal,
  });
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return apiRequest<Order>("/api/orders", { method: "POST", body: payload });
}
