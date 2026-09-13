# Cars24 Operations Copilot

Internal backend service that assists operations agents with order status, payment verification, and delivery tracking.

The copilot does not answer from model memory. Gemini issues typed function calls (`get_order_status`, `get_payment_details`, `get_delivery_logs`); those tools read SQLite; the model then returns a short, grounded ops-desk reply. Responses are cleaned before they reach HTTP or the CLI.

Architecture, failure modes, and a production scaling path are documented in [DESIGN.md](./DESIGN.md).

---

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 20+, TypeScript (strict, ESM) |
| HTTP | Express 5 |
| Store | `better-sqlite3` (WAL) |
| LLM | `@google/genai` native function calling |
| Validation | Zod |
| Logging | Pino (JSON) with `X-Correlation-Id` |
| API docs | OpenAPI 3.1 via `zod-to-openapi`, Swagger UI |

---

## Prerequisites

- Node.js **20 or later**
- A Gemini API key (`GEMINI_API_KEY`, or `GOOGLE_API_KEY` as fallback)

---

## Setup

```bash
npm install
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env`. Chat returns **503** until this is present. Restart the process after changing the file — environment is loaded at boot.

```bash
npm run seed
npm run dev
```

| Script | Description |
| --- | --- |
| `npm run seed` | Rebuild operational fixtures in SQLite |
| `npm run dev` | HTTP server (`tsx watch`) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run the compiled server |
| `npm run cli` | Interactive terminal copilot |
| `npm run typecheck` | `tsc --noEmit` |

Seed writes `./data/cars24_ops.db` (override with `DATABASE_PATH`) and loads **16 orders**. Useful cases:

| Order ID | Situation |
| --- | --- |
| `C24-ORD-1002` | Payment captured; delivery unscheduled; address missing |
| `C24-ORD-1003` | Address on file but not verified |
| `C24-ORD-1004` | Interstate EV permit delay (RTO) |
| `C24-ORD-1006` | Failed UPI, then a pending retry |
| `C24-ORD-1014` | Unverified hostel address and failed card |
| `C24-ORD-1015` | Barge-capacity delay (Panvel → Goa) |
| `C24-ORD-9999` | Unknown ID — copilot must not invent a record |

---

## Configuration

| Variable | Default | Required | Description |
| --- | --- | --- | --- |
| `PORT` | `3000` | No | HTTP listen port |
| `NODE_ENV` | `development` | No | `development` uses pino-pretty |
| `LOG_LEVEL` | `info` | No | Pino level |
| `DATABASE_PATH` | `./data/cars24_ops.db` | No | SQLite file (relative to cwd unless absolute) |
| `GEMINI_API_KEY` | — | **Yes** (chat) | Gemini key |
| `GOOGLE_API_KEY` | — | No | Used if `GEMINI_API_KEY` is unset |
| `GEMINI_MODEL` | `gemini-2.0-flash` | No | Must support function calling |

Every HTTP response includes `X-Correlation-Id`. Send the same header on later calls to join request logs.

---

## HTTP API

Base URL: `http://localhost:3000`

| Resource | URL |
| --- | --- |
| Swagger UI | [`/api/v1/docs`](http://localhost:3000/api/v1/docs) |
| OpenAPI document | [`/api/v1/openapi.json`](http://localhost:3000/api/v1/openapi.json) |
| Health | `GET /api/v1/copilot/health` |
| Chat | `POST /api/v1/copilot/chat` |

### Health

```bash
curl -s http://localhost:3000/api/v1/copilot/health
```

`200` when SQLite answers `SELECT 1`; `503` with `"status": "degraded"` otherwise.

### Chat

**Request**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `message` | string (1–4000) | Yes | Agent question |
| `sessionId` | UUID | No | Resume an existing session |
| `agentId` | string | No | Defaults to `ops-agent-anonymous` |

**Response**

| Field | Description |
| --- | --- |
| `sessionId` | Session to reuse on follow-ups |
| `answer` | Cleaned, grounded reply (not raw JSON) |
| `toolInvocations` | Tool name, args, success, duration, payload |
| `loopCount` | GenerateContent rounds used (cap **3**) |
| `truncated` | `true` if the loop cap forced a wrap-up |

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
    "sessionId": "<sessionId from the previous response>",
    "message": "Show payment attempts for that order."
  }'
```

Unknown order (must not hallucinate a record):

```bash
curl -s http://localhost:3000/api/v1/copilot/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Status of C24-ORD-9999"}'
```

| Status | Meaning |
| --- | --- |
| `400` | Body failed Zod validation |
| `503` | Missing Gemini key, or health check degraded |
| `500` | Unhandled error (correlation ID only in the body) |

---

## CLI

For desk-side testing without HTTP:

```bash
npm run cli
```

```
agent> Why is delivery delayed for C24-ORD-1015?
```

Type `/exit` or `/quit` to leave. The CLI applies the same response cleaner as the API and prints a formatted ops reply (no tool-trace footer).

---

## Tools and guardrails

| Tool | Purpose |
| --- | --- |
| `get_order_status` | Order, latest payment/delivery status, blockers |
| `get_payment_details` | All payment attempts for an order |
| `get_delivery_logs` | Delivery record and chronological events |

- Tool arguments are validated with Zod before SQL runs.
- Unknown order IDs return `found: false`; the model is instructed not to invent IDs, ETAs, or addresses.
- The orchestration loop is capped at **three** tool rounds, then a wrap-up call **without** tools (`truncated: true`).
- Answers are passed through `src/utils/cleaner.ts` (JSON wrappers, code fences, escaped newlines) before they leave the service.

---

## Project layout

```
src/
  config/          Environment and logger
  controllers/     HTTP handlers
  db/              SQLite connection, schema, seed
  docs/            OpenAPI generated from Zod
  middleware/      Correlation ID and errors
  routes/          /api/v1/copilot
  services/        Ops DAO and Gemini loop
  tools/           Zod + Gemini function declarations
  types/           Domain interfaces
  utils/           Response cleaner
  cli.ts           Terminal client
  server.ts        Process bootstrap
```

---


