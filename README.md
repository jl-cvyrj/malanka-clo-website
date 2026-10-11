# Malanca.clo website

Online clothing store — Spring Boot backend (`backend/`) + Next.js frontend (`frontend/`).

- **Plan & progress:** [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) — status, roadmap, architecture decisions, and how to resume.
- **Backend docs:** [`backend/README.md`](backend/README.md).
- **Frontend docs:** [`frontend/README.md`](frontend/README.md).

## Layout

| Path | What |
| --- | --- |
| `backend/` | Spring Boot REST API (public catalog/orders + secured `/api/admin/**`). |
| `frontend/` | Next.js App Router storefront + `/admin` panel (Belarusian-first, black & white). |
| `docs/` | `PROJECT_PLAN.md` — the living plan. |
| `Archive/` | Original design template (`templates/index.html`) used as the visual reference. |

## Status

- **Phase 0/1 — backend:** complete (REST API + tests); auto-generated OpenAPI deferred.
- **Phase 2 — frontend:** implemented and verified end-to-end (browse → product → cart → order → admin). Uncommitted in the working tree.
- **Phase 3/4:** integration hardening and deployment still to do.

## Quick start

```bash
# 1. Database + backend (see backend/README.md for details)
cd backend
cp .env.example .env            # Compose + backend both default to host port 5433
docker compose up -d
./mvnw spring-boot:run          # http://localhost:8080 (reads .env automatically)

# 2. Frontend
cd ../frontend
npm install
npm run dev                     # http://localhost:3000
```

Bootstrap the first admin by exporting `APP_ADMIN_INITIAL_USERNAME` /
`APP_ADMIN_INITIAL_PASSWORD` before the backend's first start (only used when the
`admin_users` table is empty). Never commit real values.
