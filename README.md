# Auto Clipboard Sync

A cross-device clipboard that securely synchronizes text and images in real time between all your devices. A lightweight Go desktop agent watches the OS clipboard and syncs items via a Next.js API and WebSocket hub.

## Stack

- Go desktop agent (cross-platform; runs on the host OS)
- Next.js App Router web dashboard (auth, API, WebSocket)
- PostgreSQL (Drizzle ORM)

## Quick Start (Docker Compose)

This starts the web dashboard and PostgreSQL. The desktop agent should be run on your host OS (not Docker) to access the system clipboard.

```bash
# From repo root
docker compose up --build
```

- Web Dashboard: http://localhost:3000
- Postgres: localhost:5432
- PGWeb (DB UI): http://localhost:5050

Environment used by the web app in compose:

- `POSTGRES_URL=postgres://postgres:postgres@postgres:5432/auto_paster?sslmode=disable`
- `NEXT_PUBLIC_URL=http://localhost:3000`

To stop:

```bash
docker compose down
```

## Development (Monorepo)

```bash
# Install deps
pnpm install

# Run all in dev (web + packages)
pnpm dev

# Build all
pnpm build

# Tests
pnpm test
```

Useful filters:

```bash
pnpm --filter web-dashboard dev
pnpm --filter web-dashboard build
```

Database tools (via workspace scripts):

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:studio
```

## Configuration

Create `.env.local` at the repo root for local dev (Next.js reads via `apps/web-dashboard/lib/env.ts`). Example:

```env
POSTGRES_URL=postgres://postgres:postgres@localhost:5432/auto_paster?sslmode=disable
BETTER_AUTH_SECRET=replace-with-a-strong-secret-of-32-chars-min
RESEND_API_KEY=replace-with-your-resend-key
EMAIL_DOMAIN=example.com
NEXT_PUBLIC_URL=http://localhost:3000
```

For Docker Compose, you can create `.env.docker` if needed to override additional values. Compose sets `POSTGRES_URL` and `NEXT_PUBLIC_URL` by default.

## Notes on the Agent

- The clipboard agent runs on macOS/Windows/Linux and integrates with the system clipboard. It is not run inside Docker.
- Build stubs currently live under `apps/proxy-service/` and will be renamed to `clipboard-agent` in a future cleanup.

## License

MIT License - see LICENSE file for details.
