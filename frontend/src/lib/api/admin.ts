import { apiRequest } from "./client";
import type {
  AdminSession,
  Category,
  CategoryPayload,
  Order,
  OrderStatus,
  OrderSummary,
  PageResponse,
  PaymentStatus,
  ProductDetail,
  ProductImagePayload,
  ProductPayload,
  ProductSummary,
} from "./types";

/**
 * Admin endpoints. Every call is authenticated (session cookie + CSRF) and
 * requires an ADMIN role server-side.
 */

export function login(username: string, password: string): Promise<AdminSession> {
  return apiRequest<AdminSession>("/api/admin/auth/login", {
    method: "POST",
    body: { username, password },
    authenticated: true,
  });
}

export function logout(): Promise<void> {
  return apiRequest<void>("/api/admin/auth/logout", {
    method: "POST",
    authenticated: true,
  });
}

export function me(signal?: AbortSignal): Promise<AdminSession> {
  return apiRequest<AdminSession>("/api/admin/auth/me", {
    authenticated: true,
    signal,
  });
}

/* ----------------------------- Categories ----------------------------- */

export function getAdminCategories(signal?: AbortSignal): Promise<Category[]> {
  return apiRequest<Category[]>("/api/admin/categories", {
    authenticated: true,
    signal,
  });
}

export function createCategory(payload: CategoryPayload): Promise<Category> {
  return apiRequest<Category>("/api/admin/categories", {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}

export function updateCategory(
  id: number,
  payload: CategoryPayload,
): Promise<Category> {
  return apiRequest<Category>(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: payload,
    authenticated: true,
  });
}

export function setCategoryActive(id: number, active: boolean): Promise<Category> {
  return apiRequest<Category>(
    `/api/admin/categories/${id}/${active ? "activate" : "deactivate"}`,
    { method: "POST", authenticated: true },
  );
}

/* ------------------------------ Products ------------------------------ */

export function getAdminProducts(
  query: { page?: number; size?: number } = {},
  signal?: AbortSignal,
): Promise<PageResponse<ProductSummary>> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const qs = params.toString();
  return apiRequest<PageResponse<ProductSummary>>(
    `/api/admin/products${qs ? `?${qs}` : ""}`,
    { authenticated: true, signal },
  );
}

export function getAdminProduct(
  id: number,
  signal?: AbortSignal,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/admin/products/${id}`, {
    authenticated: true,
    signal,
  });
}

export function createProduct(payload: ProductPayload): Promise<ProductDetail> {
  return apiRequest<ProductDetail>("/api/admin/products", {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}

export function updateProduct(
  id: number,
  payload: ProductPayload,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/admin/products/${id}`, {
    method: "PUT",
    body: payload,
    authenticated: true,
  });
}

export function setProductActive(
  id: number,
  active: boolean,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(
    `/api/admin/products/${id}/${active ? "activate" : "deactivate"}`,
    { method: "POST", authenticated: true },
  );
}

export function addProductImage(
  id: number,
  payload: ProductImagePayload,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/admin/products/${id}/images`, {
    method: "POST",
    body: payload,
    authenticated: true,
  });
}

export function reorderProductImage(
  id: number,
  imageId: number,
  sortOrder: number,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/admin/products/${id}/images/${imageId}`, {
    method: "PATCH",
    body: { sortOrder },
    authenticated: true,
  });
}

export function removeProductImage(
  id: number,
  imageId: number,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/admin/products/${id}/images/${imageId}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function addProductSize(
  id: number,
  sizeCode: string,
  available = true,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/admin/products/${id}/sizes`, {
    method: "POST",
    body: { sizeCode, available },
    authenticated: true,
  });
}

export function updateProductSize(
  id: number,
  sizeId: number,
  available: boolean,
): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/admin/products/${id}/sizes/${sizeId}`, {
    method: "PATCH",
    body: { available },
    authenticated: true,
  });
}

/* ------------------------------- Orders ------------------------------- */

export function getAdminOrders(
  query: { status?: OrderStatus; page?: number; size?: number } = {},
  signal?: AbortSignal,
): Promise<PageResponse<OrderSummary>> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  const qs = params.toString();
  return apiRequest<PageResponse<OrderSummary>>(
    `/api/admin/orders${qs ? `?${qs}` : ""}`,
    { authenticated: true, signal },
  );
}

export function getAdminOrder(id: number, signal?: AbortSignal): Promise<Order> {
  return apiRequest<Order>(`/api/admin/orders/${id}`, {
    authenticated: true,
    signal,
  });
}

export function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<Order> {
  return apiRequest<Order>(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
    authenticated: true,
  });
}

export function updateOrderPaymentStatus(
  id: number,
  paymentStatus: PaymentStatus,
): Promise<Order> {
  return apiRequest<Order>(`/api/admin/orders/${id}/payment-status`, {
    method: "PATCH",
    body: { paymentStatus },
    authenticated: true,
  });
}
