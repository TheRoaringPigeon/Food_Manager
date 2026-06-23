# Docker Deployment Guide

This guide covers running dev and prod stacks **simultaneously** on the same machine with isolated data.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

---

## Stack overview

| Stack | Project flag | Compose files |
|-------|-------------|---------------|
| Shared Ollama | *(standalone)* | `docker-compose.ollama.yml` |
| Dev | `-p fm-dev` | `docker-compose.yml` + `docker-compose.dev.yml` |
| Prod | `-p fm-prod` | `docker-compose.yml` + `docker-compose.prod.yml` |

Volumes are project-scoped (`fm-dev_postgres_data`, `fm-prod_postgres_data`, etc.) so dev and prod databases are completely separate even though the database names inside postgres are the same.

---

## Step 1 — Start shared Ollama (once, leave running)

```bash
cd deployment
docker compose -f docker-compose.ollama.yml up -d
```

Both dev and prod connect to this single `fm-llm` container via the `fm-llm-net` network.

---

## Step 2 — Start the app stack(s)

### Development

```bash
docker compose -p fm-dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Dev ports (all accessible from your browser/tools on the host):

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5183 |
| fm_api | http://localhost:5011 |
| llm_api | http://localhost:5012 |
| Postgres | localhost:5433 |
| pgAdmin | http://localhost:5051 |
| ChromaDB | http://localhost:8001 |

**First run:** run Alembic migrations after the stack is healthy:

```bash
docker compose -p fm-dev exec fm_api alembic upgrade head
docker compose -p fm-dev exec llm_api alembic upgrade head
```

### Production

```bash
docker compose -p fm-prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Required `.env` vars for prod:
- `CADDY_DOMAIN=home.yourdomain.com`
- `JWT_SECRET_KEY=<strong secret>`
- `VITE_BASE_PATH=/food-manager` (default if omitted)

Prod exposes only Caddy (80/443) and pgAdmin (5050). Everything else is internal.

---

## Stopping stacks

```bash
docker compose -p fm-dev down    # stop dev
docker compose -p fm-prod down   # stop prod

# Stop Ollama only when you want the LLM fully offline
docker compose -f docker-compose.ollama.yml down
```

## Restarting a single service

```bash
docker compose -p fm-dev restart fm_api
docker compose -p fm-prod restart llm_api
```

## Clean rebuild

```bash
docker compose -p fm-dev down --volumes --remove-orphans
docker compose -p fm-dev -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

---

## Frontend: local dev against the dev backend

Instead of using the in-Docker Vite server, you can run the frontend locally for the fastest hot-reload experience while the backend runs in Docker:

```bash
cd fm_frontend
VITE_API_URL=http://localhost:5011 VITE_LLM_API_URL=http://localhost:5012 npm run dev
# → http://localhost:5173
```

---

## PWA / Android install

After deploying to your HTTPS domain via Caddy:

1. Open Chrome on Android and navigate to your domain.
2. Tap the **"Install app"** prompt.
3. The app installs to the home screen and opens full-screen.

> Service workers require HTTPS — the install prompt only appears in production behind Caddy.
> To test the PWA build locally: `npm run build && npm run preview` inside `fm_frontend/`.
