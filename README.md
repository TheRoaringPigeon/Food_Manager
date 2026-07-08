# Food Manager — Developer Guide

A self-hosted family food-management app: ingredient tracking, recipe management, LLM-powered recommendations, voice food logging, and a PWA-ready frontend.

## Services

| Service | Port | Purpose |
|---------|------|---------|
| fm_api | 5001 | Core CRUD + auth (recipes, ingredients, users, families) |
| llm_api | 5002 | Recipe crawler, LLM recommendations via Ollama + ChromaDB |
| fm_frontend | 5173 | React + Vite + TypeScript + Tailwind SPA |
| postgres | 5432 | Two databases: `fm_db` (fm_api) and `llm_api` |
| chromadb | 8000 | Vector DB for semantic search |
| ollama | 11434 | Local LLM inference |
| pgadmin | 5050 | DB admin UI |

## Deployment

Docker Compose commands for running dev and prod stacks simultaneously are in [`deployment/README.md`](deployment/README.md).

Quick start:

```bash
# 1. Start shared Ollama (once, leave running)
cd deployment && docker compose -f docker-compose.ollama.yml up -d

# 2. Start dev stack
docker compose -p fm-dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build

# 3. First-run migrations
docker compose -p fm-dev exec fm_api alembic upgrade head
docker compose -p fm-dev exec llm_api alembic upgrade head
```

## Frontend local dev

Run the frontend locally with hot reload against the dev backend in Docker:

```bash
cd fm_frontend
npm install
npm run dev   # → http://localhost:5173
```

## Tests

### Backend (pytest)

Tests use an in-memory SQLite DB — no running Postgres needed.

```bash
cd fm_api
pytest                                              # all tests
pytest tests/test_health.py -v                     # single file
pytest tests/test_health.py::test_health_endpoint  # single test
```

### Frontend E2E (Cypress)

Cypress tests live in `fm_frontend/cypress/e2e/` and target the running dev stack (default port `5183`).

**Prerequisites:** the dev stack must be running (see [deployment/README.md](deployment/README.md)).

```bash
cd fm_frontend
npm install
```

**Open Cypress GUI (interactive, with browser):**

```bash
npm run cy:open
```

**Run headlessly (CI / command line):**

```bash
npm run cy:run
```

**Target a different port or base path:**

Create `fm_frontend/cypress.env.json` (already gitignored) to override defaults:

```json
{
  "port": 5183
}
```

The `baseUrl` is built from `port` + `VITE_BASE_PATH` (read from `deployment/.env` automatically). Specs live in `cypress/e2e/*.cy.ts`.

## Database migrations

Each service has its own Alembic config.

```bash
# Apply all pending migrations
docker compose -p fm-dev exec fm_api alembic upgrade head
docker compose -p fm-dev exec llm_api alembic upgrade head

# Generate a new migration (run from inside the service dir)
alembic revision --autogenerate -m "describe change"
```

## Promoting data from dev to prod

The dev and prod stacks each have isolated Docker volumes (`fm-dev_postgres_data` vs `fm-prod_postgres_data`). The steps below move the **ingredient and recipe catalog** from dev → prod without touching users, families, or any other prod-only configuration.

All commands run from the `deployment/` directory.

### Prerequisites

- Both stacks must be running (`fm-dev` and `fm-prod`).
- Prod must have had its migrations applied at least once (`alembic upgrade head`) so the schema exists.

### 1. Dump the catalog tables from dev

```bash
docker compose -p fm-dev exec -T postgres \
  pg_dump -U postgres fm_db \
  --data-only \
  --table=ingredients \
  --table=recipes \
  --table=recipe_ingredients \
  > catalog_$(date +%Y%m%d).sql
```

This produces a plain-SQL file (e.g. `catalog_20260708.sql`) in `deployment/`. The dump includes `setval` calls so auto-increment sequences are restored correctly.

### 2. Clear the catalog in prod

Truncate in dependency order to avoid FK violations. `RESTART IDENTITY` resets sequences so new IDs won't collide with the incoming data.

```bash
docker compose -p fm-prod exec postgres \
  psql -U postgres fm_db -c \
  "TRUNCATE recipe_ingredients, recipes, ingredients RESTART IDENTITY CASCADE;"
```

> **Warning:** `CASCADE` also truncates `family_recipe_statuses` and `calorie_logs` because they reference `recipes`. Any saved recipe statuses and calorie log history in prod will be lost.
>
> **TODO:** this process needs improvement — ideally the promotion script would back up `calorie_logs` and `family_recipe_statuses` before truncating and restore them afterward, filtering out rows whose `recipe_id` no longer exists. Until then, treat this as a destructive operation and only run it when losing that data is acceptable.

### 3. Load into prod

```bash
docker compose -p fm-prod exec -T postgres \
  psql -U postgres fm_db \
  < catalog_$(date +%Y%m%d).sql
```

Replace the date suffix with the filename from step 1 if running on a different day.

### 4. Re-sync ChromaDB embeddings

The llm_api vector store (ChromaDB) is separate from Postgres and holds the recipe embeddings used for semantic search. After loading new recipe data, rebuild the index:

```bash
docker compose -p fm-prod restart llm_api
```

The llm_api calls back to fm_api on startup to sync recipe data into ChromaDB. Allow 30–60 seconds for indexing to complete before testing recommendations.

### Notes

- **Family IDs are stable:** both stacks seed a `default_family` (id=1) at first startup. Recipes are owned by that family, so the FK resolves cleanly after restore.
- **Users are not touched:** only the three catalog tables are affected. Prod users, families, and JWT config are preserved.
- **Safe to re-run:** step 2 always clears first, so running the full sequence twice produces the same result.
- **llm_api DB is not migrated:** the `llm_api` Postgres database holds crawler state and job history, not the primary recipe catalog. It does not need to be promoted — restarting llm_api after step 3 is sufficient.

---

## Architecture

```
React SPA → Vite proxy → fm_api  (CRUD, auth, JWT)
                       → llm_api (crawl, embed, recommend)
                            ↓
                       ChromaDB + Ollama
```

- `fm_api/routers/` — HTTP endpoints  
- `fm_api/services/` — business logic and DB queries  
- `fm_api/models/` — SQLAlchemy ORM models  
- `fm_api/schemas/` — Pydantic request/response shapes  
- `fm_frontend/src/api/` — typed fetch wrappers  
- `fm_frontend/src/pages/` — one file per route  
