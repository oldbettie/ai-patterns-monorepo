# Development Setup - Auto Clipboard Monorepo

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all services in development (web dashboard + agent)
pnpm dev

# Build all packages and apps
pnpm build

# Run tests across the monorepo
pnpm test
```

## Project Structure

```
copy-paste/
├── apps/
│   ├── proxy-service/      # Go clipboard agent (temporary name; will be renamed)
│   └── web-dashboard/      # Next.js dashboard + API + WS hub
├── packages/
│   ├── common/             # Shared TS utilities and types
│   └── database/           # Drizzle ORM, schemas, repositories, migrations
└── docker/                 # Dockerfiles for services
```

Note: The `apps/proxy-service` directory currently contains the Go clipboard agent. It will be renamed to `clipboard-agent` in a future cleanup.

## Development Commands

### Root Level (All Services)

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all code
- `pnpm clean` - Clean all build artifacts

### Clipboard Agent (Go)

- `pnpm --filter proxy-service dev` - Run the agent locally (go run)
- `pnpm --filter proxy-service build` - Build the agent binary
- `pnpm --filter proxy-service test` - Run Go tests
- `pnpm --filter proxy-service lint` - go fmt + go vet

### Web Dashboard (Next.js)

- `pnpm web:dev` or `pnpm --filter web-dashboard dev` - Run Next.js in dev
- `pnpm web:build` or `pnpm --filter web-dashboard build` - Build Next.js app
- `pnpm --filter web-dashboard test` - Run Vitest tests
- `pnpm --filter web-dashboard type-check` - TypeScript checks

### Database (Drizzle ORM)

- `pnpm db:generate` - Generate Drizzle SQL
- `pnpm db:migrate` - Apply migrations
- `pnpm db:push` - Push schema
- `pnpm db:studio` - Open Drizzle Studio

## Running Everything Together

- `pnpm dev` will run both the Go agent and the web dashboard (leveraging workspace scripts). You can also run each independently via the filters above.

## Docker Development (Optional)

```bash
# Start all services with Docker (e.g., web-dashboard + db)
docker compose up --build

# Start specific services
docker compose up web-dashboard
```

The agent is typically run on the host OS (not Docker) to access the system clipboard.

## Environment

- Web dashboard reads env via `apps/web-dashboard/.env` using `@t3-oss/env-nextjs`
- Database connection string configured in `packages/database`
- Auth configuration in `apps/web-dashboard/lib/auth`

## Coding Standards

- Domain-driven layout: Services in `lib/services`, repositories in `packages/database/src/repositories`
- API route wrapper pattern returning `{ data, error }`
- Type-safe validation with Zod
- No `any` types (TS strict mode)
- Remove console logs before committing

## Ports

- **3000** - Web Dashboard (Next.js)
- **5432** - PostgreSQL
- **5050** - pgAdmin/pgweb (if enabled)

The clipboard agent does not expose public HTTP ports in development.
