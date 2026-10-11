# Deploying MALANKA.clo

Target stack:

| Piece    | Host      | Notes                                        |
| -------- | --------- | -------------------------------------------- |
| Backend  | Render    | Spring Boot 4 / Java 25, runs from `backend/Dockerfile` |
| Frontend | Render    | Next.js 16, Node runtime                     |
| Database | Supabase  | Managed Postgres (Flyway migrates on startup) |

The browser only ever talks to the **frontend** origin. Next.js proxies `/api/*`
to the backend (`frontend/next.config.ts`), so there is no CORS and the
session/CSRF cookies stay **first-party** — required because the admin panel
reads the `XSRF-TOKEN` cookie from `document.cookie`, and a cookie set by a
*different* host (e.g. `backend.onrender.com`) is not readable from
`frontend.onrender.com`.

```
Browser ──HTTPS──▶ frontend (Render, Next.js)
                     │  server-side rewrite for /api/*
                     ▼
                   backend (Render, Spring Boot) ──▶ Supabase Postgres
```

---

## 0. Push the code to GitHub

Render deploys from a Git repo. The repo is
`git@github.com:jl-cvyrj/malanka-clo-website.git`, but a lot of files
(`frontend/`, `docs/`, `render.yaml`, the new `backend/Dockerfile`, …) are not
committed yet.

```bash
git add -A
git commit -m "Phase 2 frontend + deployment setup"
git push origin feature/backend   # or merge into main and push that
```

> Render builds whatever branch you select when creating the service. Using
> `main` is simplest; otherwise pick `feature/backend`.

---

## 1. Create the Supabase project

1. <https://supabase.com/dashboard> → **New project**.
2. Pick a region close to your Render region (e.g. **Frankfurt** /
   `eu-central-1`).
3. Save the **database password** — you will paste it into Render.
4. **Connect** (top bar) → copy the **Session pooler** connection string.

Use the **shared pooler, session mode** (port **5432**), not the direct
connection: Supabase's direct host is IPv6-only, and Render is IPv4-only. The
shared pooler is IPv4. Session mode keeps one server connection per client
(fine for a long-running Spring app) and supports the DDL Flyway needs.

```
Host:     aws-0-<region>.pooler.supabase.com
Port:     5432
Database: postgres
User:     postgres.<project-ref>
Password: <your database password>
```

That maps to these Render env vars:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.<project-ref>
SPRING_DATASOURCE_PASSWORD=<your database password>
```

> `?sslmode=require` is mandatory — Supabase rejects non-TLS connections.
> These override the values in `backend/src/main/resources/application.yaml`
> (environment variables win over the YAML).

No manual schema step is needed: Flyway (`V1`…`V5`) runs on backend startup and
creates the tables **plus** the seeded catalog.

---

## 2. Deploy the backend on Render

**Option A — Blueprint (uses the committed `render.yaml`)**

1. Render Dashboard → **New** → **Blueprint** → connect the repo.
2. Render reads `render.yaml` and asks for the `sync: false` values.
3. Fill in the Supabase `SPRING_DATASOURCE_*` vars and the admin credentials.
4. `APP_CORS_ALLOWED_ORIGINS` can be left as the default for now (it is only
   needed for direct, non-proxied access); set it to the frontend URL later.

**Option B — Manual Web Service**

1. **New** → **Web Service** → connect the repo.
2. **Language**: `Docker`.
3. **Root Directory**: `backend`  •  **Dockerfile Path**: `./Dockerfile`
   (path is relative to the repo root).
4. **Health Check Path**: `/api/categories`.
5. Add the environment variables listed above, plus:

```
APP_ADMIN_INITIAL_USERNAME=admin
APP_ADMIN_INITIAL_PASSWORD=<a strong password>
APP_CORS_ALLOWED_ORIGINS=https://<your-frontend>.onrender.com
```

Notes:

- The container reads `$PORT` (see `server.port: ${PORT:8080}`), so it binds
  whatever Render assigns. Nothing to configure.
- `APP_ADMIN_INITIAL_*` only creates the admin **once**, when `admin_users` is
  empty. You can remove them after the first successful deploy.
- `plan: free` sleeps after ~15 min of inactivity; the first request after that
  is slow (cold start).

Wait for the deploy to go **Live**, then check:

```bash
curl -s https://<your-backend>.onrender.com/api/categories
# -> [{"id":1,"name":"Футболкі",...}, ...]
```

---

## 3. Deploy the frontend on Render

1. **New** → **Web Service** → same repo.
2. **Language**: `Node`.
3. **Root Directory**: `frontend`
4. **Build Command**: `npm ci && npm run build`
5. **Start Command**: `npm run start`
6. Environment variables:

```
NODE_VERSION=22.12.0
NEXT_PUBLIC_API_BASE_URL=            # empty → browser uses same-origin /api
BACKEND_ORIGIN=https://<your-backend>.onrender.com
```

Important:

- `NEXT_PUBLIC_*` values are inlined at **build** time — change one and you must
  redeploy.
- `NEXT_PUBLIC_API_BASE_URL` is intentionally **empty** so the browser calls
  `/api/...` on the frontend origin and Next proxies to `BACKEND_ORIGIN`.
- `NODE_VERSION` must be ≥ 20.9 for Next.js 16.

After the deploy goes Live, set the backend's `APP_CORS_ALLOWED_ORIGINS` to the
frontend URL (not required for the proxy, but keeps direct access working) and
redeploy the backend.

---

## 4. Verify

1. Open `https://<your-frontend>.onrender.com` — the catalog should load
   (this exercises the proxy + backend + Supabase).
2. Open `https://<your-frontend>.onrender.com/admin` — it redirects to
   `/admin/login`.
3. Log in with the `APP_ADMIN_INITIAL_*` credentials. You should reach the
   admin panel and be able to create/edit products.
4. Place a test order and confirm it appears in **Admin → Orders**.

If you changed the code locally after the initial deploy, just `git push`;
Render redeploys automatically.

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Backend deploy fails immediately, "no open ports" | The app isn't reading `$PORT`. Confirm `server.port: ${PORT:8080}` is present and that you rebuilt. |
| Backend starts then dies: `relation "flyway_schema_history"` / auth errors | Wrong Supabase URL/user/password, or missing `?sslmode=require`. Use the **session pooler** (IPv4), not the direct host. |
| `/api/...` on the frontend returns 502/504 | `BACKEND_ORIGIN` is wrong or the backend is still building/cold-starting. Check the backend URL directly. |
| Catalog loads but admin login does nothing | `BACKEND_ORIGIN` not set (or set at runtime but not build time); the build must see it. Redeploy the frontend. |
| Admin login works but saving products gives **403** | The CSRF cookie isn't first-party — this is exactly what the `/api` proxy prevents. Make sure `NEXT_PUBLIC_API_BASE_URL` is empty (not `http://localhost:8080`). |
| Admin bootstrap account missing | `admin_users` was already non-empty (Flyway seed) so the initial admin was never created. Insert one manually or drop the row and redeploy. |

### Local development

Unchanged from `README.md`:

```bash
cd backend  && docker compose up -d && ./mvnw spring-boot:run   # :8080
cd frontend && npm run dev                                       # :3000
```

`frontend/.env.local` now uses the same proxy as production
(`NEXT_PUBLIC_API_BASE_URL=` + `BACKEND_ORIGIN=http://localhost:8080`), so the
storefront also works from other devices on your LAN via
`http://<your-lan-ip>:3000`.
