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
