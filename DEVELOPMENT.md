# Development Setup - Proxy Family Monorepo

## Quick Start

```bash
# Install dependencies
pnpm install

# Run all services in development
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Project Structure

```
proxy-fam/
├── apps/
│   ├── proxy-service/      # Go proxy service (cross-platform binary)
│   └── web-dashboard/      # Next.js management dashboard
├── packages/
│   ├── shared-types/       # TypeScript types shared across services
│   ├── database/          # Database schemas and migrations
│   ├── config/            # Shared configuration utilities
│   └── cloudflare/        # Cloudflare Workers
└── docker/               # Dockerfiles for services
```

## Development Commands

### Root Level (All Services)
- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages and apps
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all code
- `pnpm clean` - Clean all build artifacts

### Proxy Service (Go)
- `pnpm proxy:build` - Build Go binary
- `pnpm proxy:dev` - Run proxy service in development

### Web Dashboard (Next.js)
- `pnpm web:build` - Build Next.js app
- `pnpm web:dev` - Run Next.js in development

## Docker Development

```bash
# Start all services with Docker
docker compose up --build

# Start specific service
docker compose up proxy-service
docker compose up web-dashboard
```

## Package Dependencies

- `@proxy-fam/shared-types` - Used by web-dashboard and other TypeScript packages
- `@proxy-fam/database` - Database utilities
- `@proxy-fam/config` - Configuration validation and utilities
- `@proxy-fam/cloudflare` - Cloudflare Workers

## Port Configuration

- **3000** - Web Dashboard (Next.js)
- **5432** - PostgreSQL Database
- **5050** - pgAdmin/pgweb Database UI
- **8080** - Proxy Service HTTP
- **8443** - Proxy Service HTTPS  
- **9090** - Proxy Service Management API