# guiltyPleasure 🎬

A personal diary for tracking movies and TV shows you love (guilty or not).

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │           NGINX  :80  (API Gateway)      │
                    └────────────┬───────────┬────────────────┘
                                 │           │           │
                    /api/tracker │ /api/insights         │ /
                                 ▼           ▼           ▼
                    ┌──────────────┐  ┌──────────────┐  ┌──────────┐
                    │tracker-service│  │insights-service│  │ frontend │
                    │   :3001      │  │    :3002      │  │  :5173   │
                    └──────┬───────┘  └──────┬────────┘  └──────────┘
                           │                 │
                           ▼                 ▼
                    ┌──────────┐      ┌──────────┐
                    │PostgreSQL│      │  MongoDB  │
                    └──────────┘      └──────────┘
```

## Features

- **Library** — browse your movies and shows with filters (status, type, genre) and sorting
- **Dashboard** — see what you're currently watching and what's up next
- **Add Item** — add movies/shows with live poster preview
- **Item Detail** — update status, track season/episode progress, rate and add notes
- **Insights** — charts showing watching habits by genre, monthly activity, and top-rated titles

## Tech Stack

| Layer | Tech |
|-------|------|
| Gateway | NGINX |
| Tracker API | Node.js 18 + Express + PostgreSQL |
| Insights API | Node.js 18 + Express + MongoDB + Mongoose |
| Frontend | React 18 + Vite + Recharts |
| Orchestration | Docker Compose |

## Quick Start

### Prerequisites
- Docker & Docker Compose installed

### 1. Clone and configure

```bash
git clone <repo-url>
cd guiltyPleasure
cp .env.example .env
# Edit .env if you want to change passwords
```

### 2. Run

```bash
docker-compose up --build
```

First startup takes a couple of minutes while images build and the database initializes with seed data.

### 3. Open

| URL | Description |
|-----|-------------|
| http://localhost | The app |
| http://localhost:5050 | pgAdmin (DB admin UI) |

pgAdmin login: use `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from your `.env`.

## Development

Vite HMR works through NGINX for live frontend updates.

To view logs:
```bash
docker-compose logs -f tracker-service
docker-compose logs -f insights-service
```

Log files are also written to:
- `services/tracker-service/logs/YYYY-MM-DD.txt`
- `services/insights-service/logs/YYYY-MM-DD.txt`

## API Reference

Import `guiltyPleasure.postman_collection.json` into Postman for a full collection.

### Tracker Service (`/api/tracker`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tracker` | List all (filters: status, type, genre_id, year, sort, order) |
| GET | `/api/tracker/:id` | Get one item |
| POST | `/api/tracker` | Add new item |
| PUT | `/api/tracker/:id` | Update item |
| DELETE | `/api/tracker/:id` | Delete item |
| GET | `/api/tracker/genres` | List all genres |
| GET | `/api/tracker/now` | Currently watching |
| GET | `/api/tracker/next` | Up next (plan list, top 10) |

### Insights Service (`/api/insights`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/insights/summary` | Totals and averages |
| GET | `/api/insights/by-genre` | Count and avg rating per genre |
| GET | `/api/insights/by-type` | Movies vs shows breakdown |
| GET | `/api/insights/monthly?months=12` | Monthly activity time series |
| GET | `/api/insights/top-rated?limit=10` | Highest rated items |

## Stop

```bash
docker-compose down        # stop, keep data volumes
docker-compose down -v     # stop and delete all data
```
