import type { ApiErrorBody } from "./types";

/**
 * Single place that talks to the Spring Boot API.
 *
 * - Public endpoints use a plain `fetch` (no credentials needed).
 * - Admin endpoints pass `credentials: "include"` so the HttpOnly session
 *   cookie is sent, and echo the `XSRF-TOKEN` cookie in `X-XSRF-TOKEN`
 *   (Spring Security's `csrf.spa()` convention, see PROJECT_PLAN D9).
 */

/**
 * Base URL for API calls.
 *
 * - In the browser an empty base keeps requests same-origin (`/api/...`); the
 *   rewrite in `next.config.ts` proxies them to the real backend. This keeps
 *   cookies first-party and avoids CORS entirely, which matters because the
 *   admin CSRF token is read from a JavaScript-visible cookie (a cookie set by
 *   a *different* host is not readable by `document.cookie`).
 * - During server-side rendering there is no page origin to be relative to, so
 *   the backend is called directly via `BACKEND_ORIGIN`.
 *
 * Production: set `NEXT_PUBLIC_API_BASE_URL=""` and
 * `BACKEND_ORIGIN=https://<backend-host>`.
 * Local dev (`.env.local`): the same, with `BACKEND_ORIGIN=http://localhost:8080`.
 */
const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
// Browser: relative by default, so requests are proxied by the rewrite in
// next.config.ts. Set NEXT_PUBLIC_API_BASE_URL to an absolute URL to bypass
// the proxy and call the backend directly.
const BROWSER_BASE = PUBLIC_BASE;
// Server-side rendering needs an absolute URL.
const SERVER_BASE =
  process.env.BACKEND_ORIGIN || PUBLIC_BASE || "http://localhost:8080";

export const API_BASE_URL =
  typeof window === "undefined" ? SERVER_BASE : BROWSER_BASE;

const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "X-XSRF-TOKEN";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;
  readonly path?: string;

  constructor(
    status: number,
    message: string,
    options?: { fieldErrors?: Record<string, string>; path?: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = options?.fieldErrors;
    this.path = options?.path;
  }

  static fromBody(status: number, body: unknown): ApiError {
    if (body && typeof body === "object") {
      const parsed = body as Partial<ApiErrorBody>;
      return new ApiError(status, parsed.message ?? `Памылка ${status}`, {
        fieldErrors: parsed.fieldErrors,
        path: parsed.path,
      });
    }
    return new ApiError(status, `Памылка ${status}`);
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Send the session cookie and attach CSRF on mutating requests. */
  authenticated?: boolean;
  signal?: AbortSignal;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfBootstrap: Promise<string | null> | null = null;

/**
 * The `XSRF-TOKEN` cookie is written by the first request that goes through
 * Spring Security's filter chain. If it is not present yet (e.g. a hard page
 * reload straight into the admin panel), poke a lightweight endpoint once.
 */
async function ensureCsrfToken(): Promise<string | null> {
  const existing = readCookie(CSRF_COOKIE);
  if (existing) return existing;
  if (typeof document === "undefined") return null;

  if (!csrfBootstrap) {
    csrfBootstrap = fetch(`${API_BASE_URL}/api/categories`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then(() => readCookie(CSRF_COOKIE))
      .finally(() => {
        csrfBootstrap = null;
      });
  }
  return csrfBootstrap;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, authenticated = false, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const mutating = method !== "GET";
  if (authenticated && mutating) {
    const token = await ensureCsrfToken();
    if (token) headers[CSRF_HEADER] = token;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: authenticated ? "include" : "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal,
    });
  } catch {
    throw new ApiError(0, "Не ўдалося злучыцца з серверам.");
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const raw = await response.text();
  let parsed: unknown = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
  }

  if (!response.ok) {
    throw ApiError.fromBody(response.status, parsed);
  }

  return parsed as T;
}
