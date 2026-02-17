# Gemini Style Guide

This guide outlines the software patterns, formatting decisions, and architectural principles for the Mild Inspiration project.

## 1. Architecture Overview

- **Monorepo Structure**:
  - `apps/web-dashboard`: Main Next.js application (App Router).
  - `packages/database`: Shared database schema (Drizzle ORM) and repositories.
- **Domain-Driven Design**:
  - Code is organized by domain in `lib/services/`, `packages/database`, and `lib/validators/`.

## 2. Backend Patterns

### Service/Repository Pattern
**ALWAYS** Validate use of the Service/Repository pattern for backend logic.

- **Services**: Contain business logic and authorization checks.
- **Repositories**: Handle direct database access.
- **Factory Functions**: Use factory functions to instantiate services with dependencies (repositories, user context).

**Example Service:**
```typescript
// lib/services/eventService.ts
import { EventRepository } from "@better-stack-monorepo/database/src/repositories/eventRepository"
import { ServiceContext } from "@/lib/types"

export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly context: ServiceContext | null
  ) {}

  async createEvent(data: CreateEventData) {
    if (!this.context) throw new Error("Unauthorized")
    // ... business logic ...
    return this.eventRepository.create(data)
  }
}

export const createEventService = (req: ServiceContext) => {
  return new EventService(createEventRepository(), req)
}
```

### API Routes
**ALWAYS** use the `createRouteHandler` wrapper for API routes to handle authentication context consistently.

- Located in `app/(routes)/api/core/v1/`.
- Must return `{ data: T | null, error: string | null }`.
- Use `createRouteHandler` to inject `ServiceContext`.

**Example API Route:**
```typescript
// app/(routes)/api/core/v1/events/route.ts
import { createRouteHandler } from '@/lib/auth/route-handler'
import { createEventService } from '@/lib/services/eventService'

export const GET = createRouteHandler({ isAuthenticated: true }, async (req) => {
  const eventService = createEventService(req)
  const events = await eventService.getMyEvents()
  return NextResponse.json({ data: events, error: null })
})
```

## 3. Frontend & Data Fetching Patterns

### Server Components & Pages
**ALWAYS** use Server Components (`page.tsx`) for initial data fetching.
- Fetch data directly using Server Actions or Services if strictly server-side.
- Pass data to Client Components as props.

### Server Actions
**ALWAYS** use Server Actions for client-side API requests.
- **NEVER** call API routes directly from Client Components.
- Server Actions act as a proxy/wrapper around API calls.
- Use `secureFetch` for authenticated requests and `publicFetch` for public requests.
- Handle `revalidatePath` for cache invalidation.

**Example Server Action:**
```typescript
// actions/event-actions.ts
'use server'
import { secureFetch } from "@/lib/serverUtils"
import { ApiRoutes, AppRoutes } from "@/lib/config/featureToggles"
import { revalidatePath } from "next/cache"

export async function createEventAction(formData: any) {
  const result = await secureFetch(ApiRoutes.events.list, {
    method: 'POST',
    body: JSON.stringify(formData)
  })
  
  if (result.error) return { data: null, error: result.error }
  
  revalidatePath(AppRoutes.events())
  return { data: result.data, error: null }
}
```

### Feature Toggles & Routing
**ALWAYS** use centralized routing configurations to support feature toggles and avoid magic strings.

- **App Routes**: Use `AppRoutes` from `lib/config/featureToggles.ts` for navigation.
- **API Routes**: Use `ApiRoutes` from `lib/config/featureToggles.ts` for API calls.
- **Feature Flags**: Check `FeatureConfig` before rendering feature-specific UI.

**Example Usage:**
```typescript
import { AppRoutes } from "@/lib/config/featureToggles"
import { redirect } from "next/navigation"

// In a component or action
redirect(AppRoutes.events(eventId))
```

### Translations
**ALWAYS** use translation files for user-facing text.
- Use `next-intl`.
- Translation files located in `messages/`.
- Ensure all supported languages are covered.

## 4. Coding Standards

- **Strict TypeScript**: No `any` types. Define interfaces/types for all data structures.
- **Zod Validation**:
  - All schemas in `lib/validators/`.
  - Naming convention: `create[Entity]Schema`, `update[Entity]Schema`.
- **Loading States**:
  - Implement `loading.tsx` for every page.
  - Use `Skeleton` components for granular loading states.
- **File Structure**:
  - **Server-Only Code**: Add `import 'server-only'` to files that should not leak to the client (e.g., Services).

## 5. Critical Rules (Summary)

1.  **createRouteHandler**: Always wrap API route handlers.
2.  **Service/Repository**: Decouple logic (Service) from data access (Repository).
3.  **Feature Toggles**: No magic route strings; use `AppRoutes`/`ApiRoutes`.
4.  **Server Actions**: The only way for Client Components to talk to the backend.
5.  **Translations**: All static text must be internationalized.
