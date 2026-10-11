# MALANKA.clo — frontend

Next.js (App Router) + TypeScript + CSS Modules. Belarusian-first, minimalist
black & white. Contains both the public storefront and the secured `/admin`
panel, consuming the Spring Boot API in `../backend`.

## Requirements

- Node 20+ (developed on Node 24)
- The backend running (default `http://localhost:8080`)

## Setup

```bash
npm install
cp .env.example .env.local   # already committed for local dev
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
npm run lint
```

## Environment

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Spring Boot API | `http://localhost:8080` |

No secrets belong here — the admin session is an HttpOnly cookie handled by the
browser; the frontend never stores credentials.

## Structure

```
src/
  app/
    (store)/            # public storefront (home, catalog, product, cart, checkout)
    admin/login/        # login form
    admin/(panel)/      # guarded admin: dashboard, products, categories, orders
    globals.css         # design tokens (color, spacing, type scale)
  components/           # UI, product, cart, layout, admin components (+ *.module.css)
  lib/
    api/                # client.ts (fetch wrapper, ApiError, CSRF), public.ts, admin.ts, types.ts
    format.ts           # price/enum formatting
    url.ts              # query-string + catalog href helpers
    order-storage.ts    # last-order snapshot for the success screen
    hooks/useAsync.ts
  locales/be.ts         # all UI strings (add ru.ts mirroring this and register it)
```

## Conventions

- **No hardcoded copy.** Every user-visible string comes from `src/locales`.
- **Server Components** fetch read-only data directly through `lib/api/public.ts`;
  pages opt out of caching with `cache: "no-store"` + `export const dynamic = "force-dynamic"`.
- **Client Components** are used only where interactivity requires it (cart,
  checkout, admin managers). Functions are never passed across the client
  boundary — serializable props only (see `CatalogPagination`).
- **Price is always resolved by the server.** The cart only sends product id,
  size and quantity; totals shown client-side are informational.
- Product images are external URLs (per the backend decision D2) and rendered
  with a plain `<img>` via `ProductImage`, which shows a placeholder on failure.

## Admin auth & CSRF

`lib/api/client.ts` sends `credentials: "include"` and, for mutating requests,
echoes the `XSRF-TOKEN` cookie back as the `X-XSRF-TOKEN` header (Spring
`csrf.spa()`). Admin pages call `GET /api/admin/auth/me` as a guard and redirect
to `/admin/login` on 401.

## Known constraints

- The backend has **no delete-product / delete-size** endpoints; products and
  categories are hidden by deactivating them, and sizes can only be added or
  toggled available.
- `OrderResponse` has no `id`; admin order mutations use the route `orderId`.
- INTERNATIONAL orders currently leave `totalAmount` null (backend, see
  `docs/PROJECT_PLAN.md` §11).

See `../docs/PROJECT_PLAN.md` for the full plan and remaining work.
