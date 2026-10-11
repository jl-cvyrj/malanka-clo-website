# MALANKA.clo backend

Spring Boot backend for the MALANKA.clo clothing store.

## Current stage

- PostgreSQL in Docker Compose
- Flyway migrations (`V1` schema, `V2` category seed, `V3` currency type fix)
- JPA entities, Spring Data repositories, service layer
- REST API (public catalog + orders, secured admin API)
- Session-cookie authentication with CSRF protection for `/api/admin/**`
- Centralized JSON error contract
- Integration tests against a real PostgreSQL via Testcontainers

## Requirements

- JDK 25+ (the build is verified on JDK 27)
- Maven 3.6.3+ (Maven Wrapper included)
- Docker + Docker Compose (required for integration tests)

> Lombok is pinned to `1.18.48` in `pom.xml`. Earlier versions (including the
> Spring Boot 4.1.1 default `1.18.46`) are not compatible with JDK 27. The build
> also enables annotation processing explicitly (`<proc>full</proc>`), because
> JDK 23+ disables it by default.

## Start PostgreSQL

```bash
cp .env.example .env
docker compose up -d
```

> **Port note:** the Compose service is published on host port **5433**, not the
> default 5432, to avoid clashing with a PostgreSQL already running on the host.
> The backend defaults to 5433 for the same reason; override `DB_PORT` if your
> database listens elsewhere.

## Configure

Configuration is read, in order of precedence, from real environment variables,
then the git-ignored `backend/.env` file (loaded automatically via
`spring.config.import=optional:file:.env[.properties]`), then the defaults
below (see `.env.example`):

| Variable | Purpose | Default |
| --- | --- | --- |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Database credentials | `malanka` |
| `DB_HOST` / `DB_PORT` | Database host/port | `localhost` / `5433` |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API | `http://localhost:3000` |
| `APP_ADMIN_INITIAL_USERNAME` / `APP_ADMIN_INITIAL_PASSWORD` | First-run administrator bootstrap | *(empty)* |

## Start backend

```bash
./mvnw spring-boot:run
```

Flyway runs automatically on application startup.

### Administrator bootstrap

The admin API is unreachable until at least one administrator exists. On startup, if the
`admin_users` table is empty **and** `APP_ADMIN_INITIAL_USERNAME`/`APP_ADMIN_INITIAL_PASSWORD`
are set, the first administrator is created from those values. No password is ever hardcoded.
Existing accounts are never modified.

## API

All endpoints are JSON. Errors follow a consistent shape:

```json
{
  "timestamp": "2026-01-01T10:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Product not found: hoodie",
  "path": "/api/products/hoodie",
  "fieldErrors": { "items": "must not be empty" }
}
```

### Public

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/categories` | Active categories, ordered by `sortOrder` |
| `GET` | `/api/products` | Active products. Query: `category` (slug), `sort` (`newest`\|`price_asc`\|`price_desc`\|`name_asc`), `page`, `size` (max 48) |
| `GET` | `/api/products/{slug}` | Product detail with images and sizes |
| `POST` | `/api/orders` | Create an order. Prices and size availability are resolved server-side; the client only sends product id, size code and quantity |

Example order request:

```json
{
  "type": "DOMESTIC",
  "customerName": "Іван",
  "phone": "+375291234567",
  "city": "Мінск",
  "address": "вул. Леніна 1",
  "deliveryMethod": "BELPOST",
  "paymentMethod": "FULL_PREPAYMENT",
  "items": [{ "productId": 1, "sizeCode": "M", "quantity": 2 }]
}
```

### Admin (`/api/admin/**`, role `ADMIN`)

Authentication uses an HttpOnly session cookie. State-changing admin requests additionally
require CSRF protection: the SPA reads the `XSRF-TOKEN` cookie (set on any request) and echoes
it in the `X-XSRF-TOKEN` header *(this is Spring Security's `csrf.spa()` convention)*.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/admin/auth/login` | Log in (creates session). Body: `{ "username": ..., "password": ... }` |
| `POST` | `/api/admin/auth/logout` | Invalidate the session |
| `GET` | `/api/admin/auth/me` | Current administrator |
| `GET` | `/api/admin/categories` | All categories, including inactive |
| `POST` | `/api/admin/categories` | Create |
| `PUT` | `/api/admin/categories/{id}` | Update |
| `POST` | `/api/admin/categories/{id}/activate` \| `/deactivate` | Toggle visibility |
| `GET` | `/api/admin/products` | Paged list (includes inactive) |
| `GET` | `/api/admin/products/{id}` | Detail |
| `POST` | `/api/admin/products` | Create |
| `PUT` | `/api/admin/products/{id}` | Update |
| `POST` | `/api/admin/products/{id}/activate` \| `/deactivate` | Toggle visibility |
| `POST` | `/api/admin/products/{id}/images` | Add image (external URL) |
| `PATCH` | `/api/admin/products/{id}/images/{imageId}` | Reorder image (`{ "sortOrder": n }`) |
| `DELETE` | `/api/admin/products/{id}/images/{imageId}` | Remove image |
| `POST` | `/api/admin/products/{id}/sizes` | Add size (`{ "sizeCode": "M", "available": true }`) |
| `PATCH` | `/api/admin/products/{id}/sizes/{sizeId}` | Update stock (`{ "available": false }`) |
| `GET` | `/api/admin/orders` | Paged list. Query: `status`, `page`, `size` |
| `GET` | `/api/admin/orders/{id}` | Detail with items |
| `PATCH` | `/api/admin/orders/{id}/status` | Update status |
| `PATCH` | `/api/admin/orders/{id}/payment-status` | Update payment status |

## Run tests

Integration tests start a throwaway `postgres:18.6` container, so Docker must be running:

```bash
./mvnw test
```

## Known limitations

- API documentation is not auto-generated yet: the latest `springdoc-openapi` (2.8.6) targets
  Spring Boot 3 / Spring Framework 6 / Jackson 2, while this project runs Spring Boot 4
  (Spring Framework 7 / Jackson 3). A compatible release is pending.
