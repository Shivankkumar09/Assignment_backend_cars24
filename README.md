# Cars24 Operations Copilot

Internal backend for ops agents. It answers order, payment, and delivery questions by calling typed tools against SQLite, then synthesizing an answer with Gemini function calling.

## Prerequisites

- Node.js 20+
- A Gemini API key (`GEMINI_API_KEY` or `GOOGLE_API_KEY`)

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set GEMINI_API_KEY
npm run seed
```

Seed writes `./data/cars24_ops.db` (or `DATABASE_PATH`) with 16 orders, including:

- `C24-ORD-1002` — payment succeeded, delivery unscheduled, missing address
- `C24-ORD-1003` — address verification flag is false
- `C24-ORD-1004` / `C24-ORD-1015` — delay logs (RTO / barge)
- `C24-ORD-1006` — failed then pending UPI
- `C24-ORD-1014` — unknown-style hostel address + failed card

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run seed` | Recreate operational fixtures |
| `npm run dev` | HTTP server with `tsx watch` |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled server |
| `npm run cli` | Interactive terminal copilot |
| `npm run typecheck` | `tsc --noEmit` |

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Enables pino-pretty |
| `LOG_LEVEL` | `info` | Pino level |
| `DATABASE_PATH` | `./data/cars24_ops.db` | SQLite file |
| `GEMINI_API_KEY` | — | Required for chat |
| `GOOGLE_API_KEY` | — | Fallback if Gemini key unset |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Function-calling capable model |

Every response includes `X-Correlation-Id`. Pass the same header on subsequent calls to stitch logs.

## API

Swagger UI: `http://localhost:3000/api/v1/docs`  
OpenAPI JSON: `http://localhost:3000/api/v1/openapi.json`

### Health

```bash
curl -s http://localhost:3000/api/v1/copilot/health
```

### Chat

```bash
curl -s http://localhost:3000/api/v1/copilot/chat \
  -H 'Content-Type: application/json' \
  -H 'X-Correlation-Id: desk-gurgaon-001' \
  -d '{
    "agentId": "agent.ops.gurgaon.12",
    "message": "Why is C24-ORD-1002 not scheduled for delivery?"
  }'
```

Follow-up in the same session:

```bash
curl -s http://localhost:3000/api/v1/copilot/chat \
  -H 'Content-Type: application/json' \
  -d '{
    "sessionId": "<sessionId from previous response>",
    "message": "Show payment attempts for that order."
  }'
```

Unknown order IDs are not invented. Example:

```bash
curl -s http://localhost:3000/api/v1/copilot/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Status of C24-ORD-9999"}'
```

## CLI

```bash
npm run cli
```

```
agent> Why is delivery delayed for C24-ORD-1015?
```

## Layout

```
src/
  config/          env + logger
  controllers/     HTTP handlers
  db/              SQLite + seed
  docs/            OpenAPI from Zod
  middleware/      correlation id + errors
  routes/
  services/        Ops DAO + Gemini loop
  tools/           Zod + Gemini tool schemas
  types/
  cli.ts
  server.ts
```

Architecture, guardrails, and a scaling roadmap live in [DESIGN.md](./DESIGN.md).
