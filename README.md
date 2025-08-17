# Better Stack Monorepo Template

A production-ready monorepo template for building modern web applications with:
- **Next.js App Router** with TypeScript
- **Better-auth** for authentication
- **Drizzle ORM** with PostgreSQL
- **Tailwind CSS** for styling
- **Workspace management** with pnpm

Perfect starting point for SaaS applications, dashboards, and full-stack projects.

## Tech Stack

- **Frontend:** Next.js 14+ with App Router and TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Better-auth (email/password + OAuth)
- **Styling:** Tailwind CSS with custom components
- **Package Manager:** pnpm with workspaces
- **Development:** Docker Compose for local development

## Quick Start (Docker Compose)

```bash
# From repo root
docker compose up --build
```

- Web Dashboard: http://localhost:3000
- Postgres: localhost:5432
- PGWeb (DB UI): http://localhost:5050

Environment used by the web app in compose:

- `POSTGRES_URL=postgres://postgres:postgres@postgres:5432/better-stack?sslmode=disable`
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
POSTGRES_URL=postgres://postgres:postgres@localhost:5432/better-stack?sslmode=disable
BETTER_AUTH_SECRET=replace-with-a-strong-secret-of-32-chars-min
RESEND_API_KEY=replace-with-your-resend-key
EMAIL_DOMAIN=example.com
NEXT_PUBLIC_URL=http://localhost:3000
```

For Docker Compose, you can create `.env.docker` if needed to override additional values. Compose sets `POSTGRES_URL` and `NEXT_PUBLIC_URL` by default.

## Project Structure

```
better-stack-monorepo/
├── apps/
│   └── web-dashboard/         # Next.js application
├── packages/
│   ├── common/               # Shared utilities and types
│   └── database/            # Database schemas and repositories
└── docker/                  # Docker configurations
```

### Key Features

- **Modern Stack** - Latest Next.js, TypeScript, and Tailwind CSS
- **Type Safety** - End-to-end type safety with TypeScript and Drizzle
- **Authentication** - Ready-to-use auth with Better-auth
- **Developer Experience** - Hot reloading, linting, and formatting
- **Production Ready** - Docker setup and deployment configurations

## License

MIT License - see LICENSE file for details.