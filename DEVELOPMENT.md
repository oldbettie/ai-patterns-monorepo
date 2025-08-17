# Development Setup - Better Stack Template

## Project Structure

```
better-stack-template/
├── apps/
│   └── web-dashboard/         # Next.js web application
├── packages/
│   ├── common/               # Shared utilities and types
│   └── database/            # Database schemas and migrations
└── docker/                  # Docker configurations
```

## Prerequisites

- **Node.js** 18+
- **pnpm** 8+ (package manager)
- **PostgreSQL** (database)
- **Docker** & **Docker Compose** (recommended for development)

## Quick Development Setup

### Option 1: Docker Compose (Recommended)

```bash
# Clone and enter the repository
git clone <repository-url>
cd better-stack-template

# Start all services
docker compose up --build
```

This starts:

- Web Dashboard: http://localhost:3000
- PostgreSQL: localhost:5432
- PGWeb (database UI): http://localhost:5050

### Option 2: Local Development

```bash
# Install dependencies
pnpm install

# Start PostgreSQL locally (or use Docker for just the database)
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=better-stack -p 5432:5432 -d postgres:15

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

## Development Workflow

### Database Management

```bash
# Generate new migration after schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema changes (development only)
pnpm db:push

# Open database studio
pnpm db:studio
```

### Running Individual Services

````bash
# Web dashboard only
pnpm --filter web-dashboard dev

# Build web dashboard
pnpm --filter web-dashboard build

# Run tests
pnpm test

# Lint code
pnpm lint

## Environment Configuration

### Development Environment Variables

Create `.env.local` in the project root:

```env
# Database
POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/better-stack"

# Authentication
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
NEXT_PUBLIC_URL="http://localhost:3000"

# Email (for user registration)
RESEND_API_KEY="your-resend-api-key"
EMAIL_DOMAIN="localhost"
````

### Docker Environment

For Docker Compose, create `.env.docker` if you need to override defaults:

```env
# Database
POSTGRES_URL="postgresql://postgres:postgres@postgres:5432/better-stack"

# Authentication
BETTER_AUTH_SECRET="your-32-character-secret-key-here"
NEXT_PUBLIC_URL="http://localhost:3000"
INTERNAL_URL="http://dashboard:3000"

# Email
RESEND_API_KEY="your-resend-api-key"
EMAIL_DOMAIN="localhost"
```

## Development Features

### Hot Reloading

- **Web Dashboard**: Automatic reload on file changes
- **Database Schema**: Use `pnpm db:push` for instant schema updates
- **Configuration**: Future proxy service will support hot configuration reloading

### Database Development

- **Drizzle Studio**: Visual database explorer at configured URL after running `pnpm db:studio`
- **Migrations**: Version-controlled schema changes in `packages/database/migrations/`
- **Type Safety**: Auto-generated TypeScript types from database schema

### Testing Strategy

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch

# Test specific package
pnpm --filter web-dashboard test
```

### Code Quality

```bash
# Lint all code
pnpm lint

# Format code
pnpm format

# Type check
pnpm type-check
```

## Architecture Overview

### Web Dashboard (Next.js)

- **Authentication**: Better-auth with email/password and OAuth
- **UI Components**: Tailwind CSS with custom components
- **API Routes**: Next.js App Router API endpoints
- **Real-time Updates**: WebSocket/SSE for live data
- **State Management**: React hooks and context

### Database Layer

- **ORM**: Drizzle ORM with PostgreSQL
- **Migrations**: Version-controlled schema changes
- **Types**: Auto-generated TypeScript interfaces
- **Repositories**: Clean data access layer

## Common Development Tasks

### Adding New Database Tables

1. Define schema in `packages/database/src/schemas.ts`
2. Generate migration: `pnpm db:generate`
3. Apply migration: `pnpm db:migrate`
4. Update repository if needed in `packages/database/src/repositories/`

### Adding New API Endpoints

1. Create route handler in `apps/web-dashboard/app/api/`
2. Add request/response types in `packages/common/src/types/`
3. Update OpenAPI documentation if applicable
4. Add tests for the endpoint

### Adding New UI Components

1. Create component in `apps/web-dashboard/components/`
2. Add to component exports if reusable
3. Include Tailwind classes and responsive design
4. Add Storybook story if applicable

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Reset database
docker compose down -v
docker compose up --build
```

### Port Conflicts

Default ports used:

- 3000: Web Dashboard
- 5432: PostgreSQL
- 5050: PGWeb

### Environment Variable Issues

```bash
# Verify environment variables are loaded
pnpm --filter web-dashboard dev --verbose
```

### Package Installation Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
```

## Performance Optimization

### Development Performance

- Use `pnpm dev` for fastest development experience
- Enable TypeScript incremental compilation
- Use `--filter` for working on specific packages

### Database Performance

- Use database indexes for frequently queried fields
- Monitor query performance with `EXPLAIN ANALYZE`
- Use connection pooling in production

## Security Considerations

### Development Security

- Never commit secrets to version control
- Use different secrets for development and production
- Validate all user inputs
- Use parameterized queries to prevent SQL injection

## Deployment Preparation

### Production Build

```bash
# Build all packages
pnpm build

# Test production build locally
pnpm preview
```

### Database Migration

```bash
# Ensure migrations are up to date
pnpm db:migrate

# Backup database before deployment
pg_dump $POSTGRES_URL > backup.sql
```

### Environment Preparation

Ensure production environment variables are configured:

- Strong `BETTER_AUTH_SECRET`
- Production database URL
- Valid email service configuration
- Appropriate `NEXT_PUBLIC_URL`
