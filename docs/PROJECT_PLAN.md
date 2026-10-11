# MALANKA.clo — Project Plan & Progress

> Living document. Update the **Status** boxes as work lands. Last updated: Phase 1 complete (backend API).
> Purpose: let anyone (human or agent) resume work without re-deriving context.

---

## 0. TL;DR — where we are

- **Phase 0 (unblock build & DB): ✅ done & committed.**
- **Phase 1 (Backend REST API): ✅ done & committed, except auto-generated OpenAPI docs (blocked).**
- **Phase 2 (Next.js frontend): ✅ implemented & verified (storefront + admin); uncommitted in the working tree.**
- **Phase 3 (integration & hardening): ⬜ partially covered by the Phase 2 smoke test; formal pass still pending.**
- **Phase 4 (deployment): ⬜ not started.**

Both modules exist today: `backend/` (Spring Boot API) and `frontend/` (Next.js App Router storefront + `/admin` panel).

Branch: `feature/backend` (work has been committed here, commit-by-commit). `main`/`development` are effectively empty.

---

## 1. Product & requirements (condensed)

Online clothing store **MALANKA.clo**.

- **No payment gateway. No customer accounts.** Orders are placed as a form; the store follows up manually.
- **Language:** Belarusian is primary; the design must allow Russian to be added later (don't hardcode text in components — centralize strings).
- **Design:** minimalist black & white. Responsive (mobile-first).
- **Orders must snapshot** product name, size, quantity and unit price at purchase time. The server must **always** use the DB price and **never trust the frontend**.
- **Admin panel** at a secure `/admin`, with **server-side-secured** admin endpoints. No public admin registration. **No hardcoded passwords.**
- Backend conventions: `ddl-auto=validate`; **no H2** for DB integration tests (use Testcontainers); **never return JPA entities** from the public API (DTOs only); avoid indiscriminate Lombok `@Data`/setters; safe `equals`/`hashCode`.
- Don't rewrite working modules; don't add dependencies unnecessarily; don't update versions without reason; don't commit/push without explicit permission.

---

## 2. Stack & exact versions

| Area | Choice | Version |
| --- | --- | --- |
| Language | Java | pom targets **25**; verified build/run on **JDK 27** |
| Framework | Spring Boot | **4.1.1** (Spring Framework **7.0.9**, Spring Security **7.1.1**) |
| JSON | Jackson | **3.x** (`tools.jackson.*`; annotations still `com.fasterxml.jackson.annotation`) |
| ORM | Hibernate / Spring Data JPA | Hibernate **7.4.5.Final** |
| DB | PostgreSQL | **18.6** (compose + tests) |
| Migrations | Flyway | V1–V3 |
| Build | Maven | **3.9.16** (wrapper included) |
| Build plugin | Lombok | pinned **1.18.48** |
| Tests | JUnit 5, Mockito, Testcontainers | Testcontainers **2.0.5** (renamed artifacts, see §3) |
| Frontend (planned) | Next.js + React + TypeScript | TBD in Phase 2; CSS Modules |

Node present: **24.19 / npm 11.17**. Docker **29** + Compose **5.6**.

---

## 3. Environment & critical gotchas

1. **Lombok + JDK 27:** Boot 4.1.1's default Lombok 1.18.46 throws
   `ExceptionInInitializerError: com.sun.tools.javac.tree.EndPosTable`. We pin **1.18.48** in `pom.xml`.
2. **Annotation processing is off by default on JDK 23+**: `pom.xml` sets `<proc>full</proc>` and `annotationProcessorPaths`.
3. **`@Builder.Default` removes the field initializer.** Any entity with a custom constructor must re-apply defaults explicitly there (already done for `Product`, `Order`, `AdminUser`, etc.). Watch for this pattern in future entities.
4. **Testcontainers 2.0.5** renamed artifacts: `testcontainers-junit-jupiter`, `testcontainers-postgresql`; the container type is `org.testcontainers.postgresql.PostgreSQLContainer` (not generic).
5. **A native PostgreSQL is already listening on host `127.0.0.1:5432`** (role `malanka` absent). To avoid the clash, `backend/compose.yaml` publishes Postgres on host port **5433**, the backend defaults to `DB_PORT=5433`, and `.env.example` uses `5433`. The backend loads the git-ignored `backend/.env` automatically (`spring.config.import=optional:file:.env[.properties]`); real environment variables still win. Integration tests don't care (random port).
6. **Jackson 3** — `springdoc-openapi` has **no Boot 4 release yet** (§11).
7. **Mockito self-attach** warning under JDK 27 (pre-existing); configure the Java agent if Mockito tests are added.
8. **Frontend↔backend cookies/CORS:** session cookie is HttpOnly; CSRF uses `XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header (`csrf.spa()`). Locally `localhost:3000` → `localhost:8080` is *same-site* (ports don't affect SameSite), so `SameSite=Lax` works in dev. Cross-site prod deployments will need `SameSite=None; Secure`.

---

## 4. Architecture decisions

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | Admin auth = **HttpOnly session cookie + CSRF** | Chosen over stateless tokens; server-side sessions, no tokens in JS. |
| D2 | Product images = **external URLs stored in DB** | Matches existing `product_images.url`; no file storage service needed. |
| D3 | Frontend styling = **CSS Modules** | Minimalist design; no heavy UI lib. |
| D4 | Lombok pinned + `<proc>full</proc>` | Minimal change to unblock JDK 27. |
| D5 | Corrective migration **V3** instead of editing committed **V1** | Flyway immutability. |
| D6 | **DTO mapping happens in the service layer, inside the transaction** | `open-in-view=false`; prevents `LazyInitializationException`. |
| D7 | **EntityGraph fetches only to-one associations**; collections lazy via `@BatchSize(50)` | Avoids Hibernate `MultipleBagFetchException` (two `List` bags). |
| D8 | Errors use one `ApiError` shape via `@RestControllerAdvice` (+ filter-level JSON 401/403 handlers) | Consistent client contract. |
| D9 | CSRF `csrf.spa()`; ignored only for `POST /api/orders` and `/api/admin/auth/login` | Those are anonymous and carry no session to abuse. |
| D10 | First admin provisioned from env (`APP_ADMIN_INITIAL_*`), first-run only | No hardcoded passwords; no public registration. |
| D11 | No pagination via raw Spring `Page` serialization; use `PageResponse<T>` | Stable API, decoupled from Spring internals. |

---

## 5. Roadmap

```
Phase 0  Build & DB unblock            ✅ done
Phase 1  Backend REST API              ✅ done (OpenAPI deferred)
Phase 2  Next.js frontend              ✅ done (storefront + admin; uncommitted)
Phase 3  Integration & hardening       ⬜ NEXT
Phase 4  Deployment                    ⬜
```

---

## 6. Phase 0 — Build & DB unblock ✅

- `pom.xml`: Lombok 1.18.48, `<proc>full</proc>`, `annotationProcessorPaths`, Testcontainers deps.
- `@Builder.Default` + explicit constructor defaults across entities.
- `V3__currency_varchar.sql` corrective migration.
- `AdminUser.role` `@Enumerated(EnumType.STRING)`.
- `AbstractIntegrationTest` (Testcontainers singleton) + `OrderServiceIntegrationTest`.
- README build/test docs.

**Verified:** `./mvnw clean test` and `./mvnw clean package` succeed; Flyway V1–V3 + Hibernate validate pass against `postgres:18.6`.

---

## 7. Phase 1 — Backend REST API ✅ (OpenAPI deferred)

### 7.1 Endpoint inventory (as implemented)

**Public**

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/categories` | Active only, ordered by `sortOrder`. |
| `GET` | `/api/products` | Query: `category` (slug), `sort` (`NEWEST`\|`PRICE_ASC`\|`PRICE_DESC`\|`NAME_ASC`), `page` (0-based), `size` (1–48). Returns `PageResponse<ProductSummaryResponse>`. |
| `GET` | `/api/products/{slug}` | `ProductDetailResponse` (images + sizes). 404 if missing/inactive. |
| `POST` | `/api/orders` | `CreateOrderRequest` → `OrderResponse`, **201**. Server resolves price + availability. |

**Admin** (`/api/admin/**`, requires role `ADMIN`; state-changing calls require CSRF)

| Method | Path |
| --- | --- |
| `POST` | `/api/admin/auth/login` *(CSRF-exempt; body `{username,password}`)* |
| `POST` | `/api/admin/auth/logout` |
| `GET` | `/api/admin/auth/me` |
| `GET` | `/api/admin/categories` |
| `POST` | `/api/admin/categories` |
| `PUT` | `/api/admin/categories/{id}` |
| `POST` | `/api/admin/categories/{id}/activate` \| `/deactivate` |
| `GET` | `/api/admin/products` |
| `GET` | `/api/admin/products/{id}` |
| `POST` | `/api/admin/products` |
| `PUT` | `/api/admin/products/{id}` |
| `POST` | `/api/admin/products/{id}/activate` \| `/deactivate` |
| `POST` | `/api/admin/products/{id}/images` |
| `PATCH` | `/api/admin/products/{id}/images/{imageId}` *(body `{sortOrder}`)* |
| `DELETE` | `/api/admin/products/{id}/images/{imageId}` |
| `POST` | `/api/admin/products/{id}/sizes` *(body `{sizeCode, available?}`)* |
| `PATCH` | `/api/admin/products/{id}/sizes/{sizeId}` *(body `{available}`)* |
| `GET` | `/api/admin/orders` *(query `status`, `page`, `size`)* |
| `GET` | `/api/admin/orders/{id}` |
| `PATCH` | `/api/admin/orders/{id}/status` *(body `{status}`)* |
| `PATCH` | `/api/admin/orders/{id}/payment-status` *(body `{paymentStatus}`)* |

### 7.2 Enums (must match DB CHECK constraints)

- `OrderType`: `DOMESTIC`, `INTERNATIONAL`
- `OrderStatus`: `NEW`, `CONFIRMED`, `IN_PRODUCTION`, `READY`, `SENT`, `COMPLETED`, `CANCELLED`
- `PaymentStatus`: `UNPAID`, `PARTIALLY_PAID`, `PAID`
- `DeliveryMethod`: `BELPOST`, `EUROPOST`, `MANAGER`
- `PaymentMethod`: `FULL_PREPAYMENT`, `PARTIAL_PREPAYMENT`, `PAY_ON_RECEIPT`
- `AdminRole`: `ADMIN`

### 7.3 Error contract

```json
{
  "timestamp": "2026-01-01T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for one or more fields",
  "path": "/api/orders",
  "fieldErrors": { "items": "must not be empty" }
}
```
Mapped statuses: 400 (validation/business/illegal-arg/unreadable), 401 (auth), 403 (access denied/CSRF), 404, 409 (duplicate slug/username), 500.

### 7.4 Key files

- Controllers: `category/{CategoryController,AdminCategoryController}`, `product/{ProductController,AdminProductController}`, `order/{OrderController,AdminOrderController}`, `admin/AdminAuthController`.
- DTOs/mappers: `*Response`/`*Request`/`*Mapper` in each feature package; `common/web/{PageResponse,ApiError}`.
- Errors: `common/exception/GlobalExceptionHandler` + `config/{RestAuthenticationEntryPoint,RestAccessDeniedHandler}`.
- Security: `config/SecurityConfig`, `admin/{AdminUserDetailsService,AdminAccountInitializer}`.
- Reads return DTOs from services (`ProductService.findActiveSummaries`, `findActiveDetail`, `findSummariesForAdmin`, `findDetailForAdmin`; `OrderService.findPage`, `findDetail`).

### 7.5 Tests (all green: **17 tests**)

- `ProductApiIntegrationTest` (7), `OrderApiIntegrationTest` (4), `AdminApiIntegrationTest` (4), plus `BackendApplicationTests` (1), `OrderServiceIntegrationTest` (1).
- `@SpringBootTest` + `@AutoConfigureMockMvc` (Boot 4 package: `org.springframework.boot.webmvc.test.autoconfigure`), real Postgres via `AbstractIntegrationTest`.

### 7.6 Phase 1 leftovers

- [ ] **Auto-generated OpenAPI** — blocked, see §11. Either wait for a Boot-4-compatible `springdoc`, hand-write an `openapi.yaml`, or add a lightweight docs endpoint.
- [ ] (Optional) Admin user management endpoints (create/disable/rename/change-password) — `AdminUserService` already supports them; no controller yet. Not required by the spec, but useful.

---

## 8. Phase 2 — Next.js frontend ✅

**Goal:** a Belarusian-first, minimalist black/white storefront + secure admin, consuming the Phase 1 API.

### 8.1 Setup
- [x] Create `frontend/` with Next.js (App Router) + TypeScript.
- [x] Enable CSS Modules; set up a global black/white design token layer (spacing, type scale, grays).
- [x] `.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080` (plus a committed `.env.example`).
- [x] Centralize all UI strings in `src/locales/be.ts` (structured so `ru.ts` can be added); no hardcoded copy in components.
- [x] API client wrapper using `fetch` with `credentials: 'include'` for the admin area (`src/lib/api/{client,public,admin}.ts`).

> **Implementation notes:** Next.js **16.4.0** / React **19.3.0**; `cacheComponents`/`partialPrefetching` left disabled, so data fetching uses `cache: "no-store"` + `export const dynamic = "force-dynamic"`. Product images are arbitrary external URLs, rendered with a plain `<img>` (`@next/next/no-img-element` disabled) through a `ProductImage` component with a graceful placeholder. The Archive design (Oswald type, gray bands, black identity strip, category carousel, product grid) was ported into CSS Modules.

### 8.2 Public storefront
- [x] Catalog page (`/` or `/catalog`): grid of product cards (image, name, price), category filter, sort (`NEWEST`/`PRICE_ASC`/`PRICE_DESC`/`NAME_ASC`), pagination — maps to `GET /api/products`.
- [x] Category navigation from `GET /api/categories` (seed: Футболкі, Лонгслівы, Худзі).
- [x] Product page (`/products/[slug]`): gallery from `images`, size selector from `sizes` (disable `available=false`), quantity, add-to-cart — maps to `GET /api/products/{slug}`.
- [x] Cart (client-side state; localStorage): items keyed by productId+size.
- [x] Checkout: form (name, phone, email, country/city/address, delivery method, payment method, comment, order type) → `POST /api/orders`; then a success screen showing `orderNumber` + totals.
- [x] Responsive + accessible (keyboard, focus states, alt text).

### 8.3 Admin (`/admin`)
- [x] Login page → `POST /api/admin/auth/login` (credentials). On success, session cookie is set.
- [x] **CSRF handling:** read `XSRF-TOKEN` cookie and send it as `X-XSRF-TOKEN` on every mutating request. No token needed for login/order.
- [x] Route guard: call `GET /api/admin/auth/me`; redirect to login on 401.
- [x] Products: list (paged, includes inactive), create/edit form, activate/deactivate, manage images (add/reorder/delete) and sizes/stock.
- [x] Categories: CRUD + activate/deactivate.
- [x] Orders: paged list with status filter, detail view, update status and payment status.
- [x] Logout → `POST /api/admin/auth/logout`.

### 8.4 Definition of done for Phase 2
- [x] `npm run build` clean; no TS errors (14 routes) — `npm run lint` also clean.
- [x] Manual happy-path verified against a live backend: browse → product → cart → order → appears in admin.
- [x] Admin: login, create product + image + size, see it in the storefront, update an order status.
- [x] No hardcoded secrets; all API calls go through the wrapper.

**Verified (2026-10-11):** Postgres (`postgres:18.6`, host port **5433** to avoid the native PG on 5432) + backend (8080) + frontend (3000). Seeded a product (image + sizes S/M/L/XL) via the admin API, placed a DOMESTIC order (`POST /api/orders` → `MLK-…`, subtotal = total = 119.80), then confirmed it in `GET /api/admin/orders` and exercised `PATCH …/status` + `…/payment-status`. Storefront routes all 200; `/products/{unknown}` correctly returns **404**.

---

## 9. Phase 3 — Integration & hardening ⬜

- [ ] End-to-end pass against a seeded DB (the V2 seed only has 3 empty categories; add demo products/images/sizes for realistic UX — via a dev-only seed or the admin UI).
- [ ] Rate limiting / abuse protection on `POST /api/orders` (consider a simple throttle).
- [ ] Input sanitization review; ensure `description`/`comment` render safely on the frontend.
- [ ] Replace placeholder shipping logic (currently `shippingAmount = 0`, `total = subtotal` for DOMESTIC; INTERNATIONAL totals unset) with real rules — **note:** INTERNATIONAL orders currently leave `totalAmount` null; decide behavior.
- [ ] Internationalization: add `ru` strings and a locale switch.
- [ ] Accessibility & responsive QA on real devices.
- [ ] Error/loading/empty states everywhere.
- [ ] Confirm CSRF + cookie flags for the intended deployment topology (`SameSite`, `Secure`, `HttpOnly`, path).

---

## 10. Phase 4 — Deployment ⬜

- [ ] Backend Dockerfile (multi-stage Maven build → JRE runtime).
- [ ] Frontend build (standalone Next.js output) + reverse proxy (single origin recommended, to keep cookies first-party).
- [ ] Production Postgres + credentials via env/secrets manager.
- [ ] `APP_CORS_ALLOWED_ORIGINS` set to the real frontend origin(s); `APP_ADMIN_INITIAL_*` used once, then removed.
- [ ] HTTPS; then consider `SameSite=None; Secure` cookie if frontend/backend are on different sites.
- [ ] DB backup strategy; Flyway migrations as part of deploy.
- [ ] Health checks, structured logs, basic monitoring.
- [ ] `docker compose`-based local prod-like run documented in README.

---

## 11. Known issues / backlog

| Item | Status | Notes |
| --- | --- | --- |
| **OpenAPI docs** | Blocked | Latest `springdoc-openapi` is 2.8.6 → Spring Boot 3 / Spring Framework 6 / Jackson 2. This project is Boot 4 (Spring Framework 7 / Jackson 3). No compatible release. Interim: hand-written `openapi.yaml` or README tables. |
| INTERNATIONAL order totals | Open | `OrderService.createOrder` only sets `shippingAmount`/`totalAmount` for `DOMESTIC`; `INTERNATIONAL` leaves `totalAmount` null. Decide rule or require manager quote. |
| Admin user CRUD API | Not exposed | Service exists; no controller. Optional. |
| Mockito JDK 27 self-attach | Cosmetic | Add Mockito as a Java agent when Mockito tests are introduced. |
| Native PG on 5432 | Env | Compose + backend default to **5433** to avoid it; tests unaffected. |
| `.env` loading | Fixed | The backend now imports `backend/.env` (`spring.config.import=optional:file:.env[.properties]`); previously it was only used by Compose, so a `DB_PORT` set there was ignored and the app fell back to 5432. |
| `/products/{unknown}` offline | Resolved | With a live backend it returns **404** (verified). If the backend is unreachable the page throws (`status 0`), so the server returns 500 and the storefront `(store)/error.tsx` boundary renders the friendly message client-side — expected. |
| Unused `ProductService.findAllActive*` | Keep | Left in place; not used by controllers after DTO reads were added. |

---

## 12. Resume checklist (commands)

```bash
# Backend: build + run tests (needs Docker for Testcontainers)
cd backend
./mvnw -o test            # 17 tests expected
./mvnw spring-boot:run    # needs a reachable Postgres; Flyway migrates on start

# Local DB — Compose publishes Postgres on host port 5433 (§3)
cp .env.example .env
docker compose up -d

# Bootstrap the first admin (empty admin_users table only).
# Either export these, or put them in backend/.env (loaded automatically).
export APP_ADMIN_INITIAL_USERNAME=admin
export APP_ADMIN_INITIAL_PASSWORD='choose-a-strong-one'

# Frontend (Phase 2 — implemented)
cd frontend
npm install
# .env.local sets NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
npm run dev               # http://localhost:3000
npm run build && npm run start   # production build
npm run lint
```

> The backend reads `backend/.env` automatically (git-ignored), so `DB_PORT=5433`
> from `.env.example` is honoured. Real environment variables override it. If your
> database runs on a different port, set `DB_PORT` accordingly.

**Resume by:** Phase 3 (§9) — end-to-end pass on a seeded DB, throttling orders, the `ru` locale, and shipping-rule decisions. For backend follow-ups, see §7.6 and §11.

---

## 13. Git state (at time of writing)

- Branch: **`feature/backend`**; commits are incremental (Phase 0 and Phase 1 largely committed).
- Pending working-tree changes: `README.md`, `backend/README.md`, and the whole new `frontend/` module plus untracked `docs/` and `Archive/`.
- No push performed by the agent; commits were made by the user.

Commit trail (most recent first): `7241aa5 Tests` → `784fcd0 Admin controller, auth and security` → `8c20d5e Global exception handler and page response` → `bafe109 Order Controller and fixes` → `43a8c15 Product Controller` → `e88ec59 Category Controller` → `3f6045f Tests and db fix` → …
