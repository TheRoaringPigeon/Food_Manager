# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the stack

Ollama runs as a **shared** standalone service so only one GPU container runs regardless of dev/prod. Start it once and leave it running:

```bash
cd deployment
docker compose -f docker-compose.ollama.yml up -d
```

Dev and prod stacks run simultaneously with isolated data volumes and offset ports:

```bash
# Dev  (ports: fm_api→5011, llm_api→5012, frontend→5183, postgres→5433, pgadmin→5051)
docker compose -p fm-dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# Prod (Caddy on 80/443, pgAdmin→5050, everything else internal)
docker compose -p fm-prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Stop a stack
docker compose -p fm-dev down
docker compose -p fm-prod down

# Restart a single service
docker compose -p fm-dev restart fm_api

# First-time dev DB migrations (after first up)
docker compose -p fm-dev exec fm_api alembic upgrade head
docker compose -p fm-dev exec llm_api alembic upgrade head
```

Frontend only (local dev, hot reload):
```bash
cd fm_frontend && npm run dev  # http://localhost:5173
```

## Service map

| Service | Port | Purpose |
|---------|------|---------|
| fm_api | 5001 | Core CRUD + auth (recipes, ingredients, users, families) |
| llm_api | 5002 | Recipe crawler + LLM recommendations via Ollama + ChromaDB |
| fm_frontend | 5173 | React SPA |
| postgres | 5432 | Two databases: `fm_db` (fm_api) and `llm_api` (llm_api) |
| chromadb | 8000 | Vector DB for semantic search |
| ollama | 11434 | Local LLM inference (container: fm-llm) |
| pgadmin | 5050 | DB admin UI |

## Database migrations

Each API has its own Alembic config. Run from inside the service directory (or via `docker compose exec`):

```bash
alembic upgrade head        # apply all pending migrations
alembic upgrade heads       # use this if multiple heads exist
alembic revision --autogenerate -m "description"
```

Migration chain lives in `fm_api/alembic/versions/` and `llm_api/alembic/versions/`. When creating a new migration, verify `down_revision` points to the actual current head (`alembic heads` to check).

## Running tests

Tests live in `fm_api/tests/`. They use an in-memory SQLite database — no running Postgres required.

```bash
# from fm_api/
pytest                                           # all tests
pytest tests/test_health.py -v                  # single file
pytest tests/test_health.py::test_health_endpoint  # single test
```

`pytest.ini` sets `asyncio_mode = auto` so async test functions work without decorators.

## Architecture patterns

**Request path:** React SPA → Vite proxy (`/food-manager/api/*` → fm_api, `/food-manager/llm/*` → llm_api) → FastAPI → AsyncSession → PostgreSQL

**fm_api internal layers:**
- `routers/` — HTTP endpoints, dependency injection, HTTP error raising
- `services/` — business logic, all DB queries live here
- `models/` — SQLAlchemy ORM models
- `schemas/` — Pydantic request/response shapes
- `dependencies/auth.py` — `get_current_user` and `require_admin` FastAPI dependencies
- `utils/seeder.py` — runs at startup via lifespan to seed `default_family` and `Admin`/`Admin` user

**Auth flow:** JWT issued at login, decoded in `dependencies/auth.py` via `get_current_user`. Token carries `user_id`, `role`, `family_id`. All protected routes inject `get_current_user` or `require_admin`.

**Soft delete:** Users are never hard-deleted. `DELETE /users/{id}` sets `is_active=False`. The seeder skips re-seeding if a record exists regardless of `is_active`, which prevents the default Admin from being recreated after deletion. Inactive users are excluded from `GET /users` by default and cannot authenticate.

**llm_api** crawls recipe sites via Crawl4AI, stores embeddings in ChromaDB, and answers recommendation queries by combining vector search with Ollama inference. It calls back to fm_api (`FM_API` env var) to sync recipe data.

## Frontend conventions

When creating a new page or component, read the existing pages in `fm_frontend/src/pages/` before writing any markup. Match the Tailwind class patterns, container layout, heading styles, card/panel structure, and theme token usage found there. Do not introduce new patterns when existing ones already cover the case.

## Key env vars

`fm_api`: `JWT_SECRET_KEY`, `JWT_EXPIRY_MINUTES`, `LLM_API` (→ llm_api base URL), `API_CONTEXT_PATH` (default `/food-manager/api`)

`llm_api`: `OLLAMA_HOST`, `OLLAMA_MODEL`, `CHROMA_HOST`/`CHROMA_PORT`, `FM_API` (→ fm_api base URL), `CRAWL_LIMIT`, `API_CONTEXT_PATH` (default `/food-manager/llm/api`)

`fm_frontend`: `VITE_API_URL` (→ fm_api), `VITE_LLM_API_URL` (→ llm_api) — in Docker these point to container service names.
