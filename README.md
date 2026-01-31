# Better Stack Monorepo Template

A production-ready monorepo template for building modern web applications with:
- **Next.js App Router** with TypeScript
- **Better-auth** for authentication
- **Drizzle ORM** with PostgreSQL
- **Tailwind CSS** for styling
- **Workspace management** with pnpm
- **I18n Translations** OPTIONAL 

Perfect starting point for SaaS applications, dashboards, and full-stack projects.
This stack is optimised for AI workflows. Generally speaking when these patterns are followed then code review becomes much simpler and refactoring later becomes trivial.
Most template repos contain loads of crap that most people wont use and will just slow them down. The core concept here has 2 parts.

## Part 1 Services/Repositories
Service/repository is a popular pattern both in AI coding and traditioanl coding. It shines as a core business layer for the following reasons 
- DDD or Onion Architecture.
- Consistently testable.
- Easy to refactor and extend.
- Easy to for example completely swap from Drizzle to Supabase ORM at any point, just replace the repository layer for a single service at a time.
- Simpler code reviews
- Easier for AI to find references via services rather then complex API route structurues reducing context side and repetitive code.

## Part 2 Server/Client relationship
Next.JS server actions were actually designed as a sort of proxy to access API layers. People have just started using them incorrectly for direct backend executions. Exposing API configuration opens not only the current route but your entire platform to direct to public API access. There are several situations where I have collected hundreds of thousands of emails or user information because of this exact thing.

A simple example if I can see that `/users/1234` exists why cant I run a script that hits every single api call from 0 to 1,000,000? or some people even have routes like `/users/list` which gets me all of this data in a single API request.

Protecting our API is arguably the most important part of any project.

### Server/Client Rules
- Always do data fetching on the server usually async `page.tsx` or `layout.tsx` files.
- Never call an API route directly from the client (If you need to trigger an API route from the client use the Server Actions as they are intended)(use the `secureFetch()` & `publicFetch()` methods I have created. They cannot be imported on the client and will fail)
- `secureFetch` requires a user session to exist
- `publicFetch` does not require a user session

### API layer wrapper function
This part can be a bit hard to understand its castings so I would rather just understand how to use it rather then how it works.

### Public API routes
The following code is a simple example of a public called api route
- PATCH works exactly as next.js does by default
- createRouteHander is a route specific authentication layer. This can be expanded in the future to cover things like tenant based authentication ect.
- `{params}` & `req` work exactly the same as normal Next.js for public routes.
````typescript
export const PATCH = createRouteHandler({ isPublic: true }, async (req, { params }: { params: Promise<{ param: string }> }) => {
    const { param } = await params
    return NextResponse.json({
        data: {
            param,
        },
        error: null,
    }, { status: 200 })
})
````
see `/(routes)/api/core/v1/users/[params]` for the actual API route

### Secure API routes
Secure routes work in tandem with `secureFetch()` here we dont have any params but we have an attatched user and `isAuthenticated: true` requires a user to be able to access this route.

````typescript
export const GET = createRouteHandler({ isAuthenticated: true }, async req => {
  // The authenticated user sent via secureFetch() method in any application
  const user = req.user
  const session = req.session

  return NextResponse.json({
    data: {
      user: user,
    },
    error: null,
  })
})
````
see `/(routes)/api/core/v1/users` for the actual API route to fetch user info

### Summary of API Arcitecture
These function exactly as normal API routes in Next.js you can do all the same things with them as normal API routes. This method of flow just adds a route based authentication layer that can be easily extended in the future. 

I want to emphisis the importance of layers here. Layers and patterns are repeatable and maintainable. AI is a pattern machine, the goal here is to always be moving forward quickly, these patterns allow me and my tools to move as quickly as possible.

### Summary of API Arcitecture (Technical)
These are called higher order functions that take a function as an arguement. Feel free to look at how `createRouteHander` works if you want to learn more. I personally use this with tenant based architecure and pro service plans to account for things like the following example

## Putting it together
See `/(routes)/api/core/v1/users` for the full backend usage example with these patterns icluded but an API route should only be around 4-5 lines of actual code always.

````typescript
export const PATCH = createRouteHandler({ isAuthenticated: true }, async (req, { params }: { params: Promise<{ userId: string }> }) => {
  try {
    // 1. Route segments
    const { userId } = await params
    const body = await req.json()
    
    // 2. Form valiadtions
    const validatedData = updateUserSettingsSchema.parse(body)

    // 3. Business Logic
    const userService = createUserService(req)
    await userService.updateUserSettings(userId, validatedData)

    // 4. Results
    return NextResponse.json({
      data: { success: true },
      error: null,
    })
  } catch (error: any) {}
}
````

## Tech Stack

- **Frontend:** Next.js 16+ with App Router and TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Better-auth (email/password + OAuth)
- **Styling:** Tailwind CSS with custom components
- **Package Manager:** pnpm with workspaces
- **Development:** Docker Compose for local development

## Quick Start (Docker Compose)

```bash
# From repo root
docker compose up --build -d

pnpm db:migrate

pnpm run dev
```

- Web app: http://localhost:3000
- Postgres: localhost:5432
- PGWeb (DB UI): http://localhost:5050

Environment used by the web app in compose:

- `POSTGRES_URL=postgres://postgres:postgres@postgres:5432/better-stack?sslmode=disable`
- `NEXT_PUBLIC_URL=http://localhost:3000`

To stop:

```bash
docker compose down
```

## Development commands (Monorepo)

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
pnpm --filter web-app dev
pnpm --filter web-app build
```

Database tools (via workspace scripts):

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## Configuration

Create `.env.local` at the repo root for local dev (Next.js reads via `apps/web-app/lib/env.ts`). Example:

```env
NEXT_PUBLIC_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-strong-secret-of-32-chars-min
RESEND_API_KEY=replace-with-your-resend-key
EMAIL_DOMAIN=example.com
POSTGRES_URL=postgres://postgres:postgres@localhost:5432/better-stack?sslmode=disable
```

For Docker Compose, you can create `.env.docker` if needed to override additional values. Compose sets `POSTGRES_URL` and `NEXT_PUBLIC_URL` by default.

## Project Structure

```
better-stack-monorepo/
├── apps/
│   └── web-app/         # Next.js application
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
- **Production Ready** - Docker setup (Local DB) and deployment configurations are simple

## Deployment

My web hosting platform of choice is [Railway](https://railway.com?referralCode=4uNPq2) for all deployments.
Neon for our Postgres database
We use github actions for database migrations and running out tests before any deployment
I use Cloudflare for domain hosting

just add your env variables to Github secrets and Railway env configuration

## License

MIT License - see LICENSE file for details.
