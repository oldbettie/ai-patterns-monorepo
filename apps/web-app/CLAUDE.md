# CLAUDE.md - Instructions for AI Assistant

## Project Overview

**Web Dashboard Template** - A modern Next.js SaaS template with:
- **Complete authentication system** with Better Auth (login, signup, password reset, email verification)
- **Internationalization** support with next-intl (English/Japanese)
- **Modern UI components** with Tailwind CSS and dark mode
- **Dashboard structure** ready for customization
- **Type-safe development** with TypeScript
- **Database integration** with Drizzle ORM

### Technology Stack
- **Frontend:** Next.js 15 with App Router
- **Styling:** Tailwind CSS with dark mode support
- **Authentication:** Better Auth with session management
- **Database:** PostgreSQL with Drizzle ORM
- **Email:** Resend for transactional emails
- **Internationalization:** next-intl for multi-language support
- **TypeScript:** Strict type safety throughout

## Critical File Reading Guidelines

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use the gemini MCP to leverage Google Gemini's large context capacity.

### ⚠️ NEVER READ THESE FILES UNLESS ABSOLUTELY REQUIRED AND ALWAYS USE GEMINI MCP:
- `node_modules/` - Contains thousands of dependency files
- `pnpm-lock.yaml` - Large lockfile with dependency versions
- `package-lock.json` - Alternative lockfile format
- `.next/` - Build output directory
- `public/` - Static assets unless specifically needed
- Large log files or build artifacts

### READ THESE FILES FOR CONTEXT:
- `package.json` - Dependencies and scripts
- `README.md` - Project setup and overview
- `lib/` - Core business logic and services
- `components/` - React components
- `app/` - Next.js app router structure

### MCP Notes

#### Gemini MCP

Use gemini -p when:
  - Analyzing entire codebases or large directories
  - Comparing multiple large files
  - Need to understand project-wide patterns or architecture
  - Current context window is insufficient for the task
  - Working with files totaling more than 100KB
  - Verifying if specific features, patterns, or security measures are implemented
  - Checking for the presence of certain coding patterns across the entire codebase

Important Notes:
  - Paths in @ syntax are relative to your current working directory when invoking gemini
  - The CLI will include file contents directly in the context
  - No need for --yolo flag for read-only analysis
  - Gemini's context window can handle entire codebases that would overflow Claude's context
  - When checking implementations, be specific about what you're looking for to get accurate results # Using Gemini CLI for Large Codebase Analysis

## Architecture & Patterns

ALWAYS USE THE TAGGING STRATEGY LISTED IN THIS FILE FOR FINDING CODE OR REFERENCES. If you cannot find anything as a last resort you can fallback to using normal
grep searching.

### Code Organization
- **Domain-Driven Design** with separation of concerns
- **Repository Pattern** for data access (`/lib/repositories`)
- **Service Layer** for business logic (`lib/services/`)
- **Server-Only** code marked with `import "server-only"`
- **Server-Actions** in (`/actions`)
- **Business API Routes** in `app/(routes)/api/core/`
- **Auth API Routes** in `app/(routes)/api/auth/`

### Key Patterns
1. **Authentication** - Complete auth flow with Better Auth
2. **Services** - Business logic (e.g., `UserService`)
3. **Repositories** - Data access abstraction
4. **Validation** - Zod schemas in `lib/validationSchema/`
5. **Components** - Reusable UI in `components/`
6. **Hooks** - Custom React hooks in `components/hooks/`
7. **Actions** - Server actions for API communication (`/actions`)

## Development Commands

### Testing
```bash
pnpm test          # Run Vitest tests
pnpm test:watch    # Run tests in watch mode
```

### Linting
```bash
pnpm lint          # Run ESLint
pnpm type-check    # TypeScript type checking
```

### Build
```bash
pnpm build         # Build for production
```

### Development
```bash
pnpm dev           # Start development server
```

## Testing Patterns
Black box testing with service layer testing mandatory

### Test Structure
- **Vitest** with TypeScript support
- **Mock repositories** for testing services
- **Test files** end with `.test.ts`
- **Setup** in `tests/setup.ts`

### Testing Best Practices
```typescript
// Example test pattern
describe("ServiceName", () => {
    const createTestService = () => {
        const repositories = {
            userRepo: new MockUserRepository(),
            // ... other mocks
        }
        
        const service = new ServiceName(repositories.userRepo)
        return { ...repositories, service }
    }
    
    it("should do something", async () => {
        const { service } = createTestService()
        // ... test logic
    })
})
```

## Component Patterns

### UI Components
- **Custom UI components** in `components/ui/`
- **Tailwind CSS** for styling with dark mode support
- **TypeScript** interfaces for props
- **Responsive design** with mobile-first approach

### Form Handling
- **React Hook Form** with Zod validation
- **Custom form components** in `components/form/`
- **Validation schemas** in `lib/validationSchema/`

## API Patterns

### Route Structure Example
```
app/(routes)/api/
├── auth/           # Authentication endpoints
└── core/v1/        # Business API endpoints
    ├── users/
    └── [other-resources]/
```

API routes are always wrapped in the following format
```typescript
  // Public route
  export const GET = createRouteHandler({ isPublic: true }, async (req, ctx) => {
    // No auth required
  })

  // Authenticated route  
  export const POST = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
    const { user, session } = req
  })
```

### API Conventions
- **RESTful** endpoints
- **Validation** with Zod schemas
- **Error handling** with custom error types always returning `{ data: T | null, error: error | null }`
- **Authentication** middleware for protected routes

## Authentication System

### Better Auth Integration
- **Complete auth flow** - login, signup, password reset, email verification
- **Session management** with secure cookies
- **Email verification** with Resend integration
- **Password reset** with secure tokens
- **TypeScript integration** with proper typing

### Auth Components
- **Login/Signup forms** with validation
- **Password reset flow** with email templates
- **Email verification** with success/error states
- **Auth status component** for current user display

## Internationalization

### next-intl Setup
- **Multi-language support** (English/Japanese included)
- **Translation files** in `messages/[locale].json`
- **Type-safe translations** with TypeScript
- **Server and client component support**

### Adding New Languages
1. Create new translation file in `messages/[locale].json`
2. Update `lib/i18n/config.ts` with new locale
3. Add language option to `components/language-selector.tsx`

## Database Patterns

### Drizzle ORM
- **Type-safe queries** with Drizzle
- **Schema definitions** in workspace database package
- **Migration system** for schema changes
- **Repository pattern** for data access

## Common Tasks

### Adding New Features
1. Create service in `lib/services/`
2. Add repository if needed
3. Create API routes in `app/(routes)/api/core/v1/`
4. Build UI components
5. Add translations
6. Add tests

### Working with Forms
1. Create Zod schema in `lib/validationSchema/`
2. Use React Hook Form with `@hookform/resolvers`
3. Create form components in `components/`
4. Handle submission with server actions or API calls

## Performance Considerations

### Next.js Optimization
- **Server components** by default
- **Client components** only when needed
- **Image optimization** with Next.js Image
- **Code splitting** with dynamic imports

### Best Practices
- **Type-safe development** with strict TypeScript
- **Server-only imports** for sensitive code
- **Proper error boundaries** for error handling
- **Responsive design** for all screen sizes

## Troubleshooting

### Common Issues
1. **Build failures** - Check TypeScript errors first
2. **Test failures** - Verify mock implementations
3. **Auth issues** - Check Better Auth configuration
4. **Translation missing** - Verify translation keys exist

### Debug Tools
- **Browser dev tools** for client-side debugging
- **Next.js built-in debugging** for server issues
- **TypeScript compiler** for type checking

## Important Notes

- **Never commit** secrets or API keys
- **Follow** the existing code patterns
- **Use TypeScript** strictly - no `any` types
- **Test** new features thoroughly
- **Follow** the repository pattern for data access
- **Use server components** when possible
- **Maintain** translation files for i18n
- **Follow** authentication best practices

# AI MUST USE TOOLS

## AI Tagging System

## Overview
This project uses a structured tagging system to help AI assistants quickly find relevant code and maintain consistency across the codebase. Always check `ai-tags.md` for current tags before creating new ones.

## Core Tag Types
- **@feature:** - Specific feature being implemented (e.g., `@feature:user-auth`)
- **@domain:** - Business domain (e.g., `@domain:auth`, `@domain:users`)
- **@backend** / **@api** / **@frontend** - System layer
- **@reusable** - Components/utilities that can be reused
- **@shared** - Code shared across multiple domains

## Tag Format
Add tags as comments at the top of files:

```javascript
// @feature:user-auth @domain:auth @frontend
// @summary: User authentication form with validation
```

```typescript
// @feature:user-management @domain:users @api
// @summary: User management API endpoints
```

## Finding Related Code
Use grep to search for tags when looking for related code:

```bash
# Find all user auth related code
grep -r "@feature:user-auth" src/

# Find frontend authentication code
grep -r "@domain:auth.*@frontend" src/

# Find all reusable components
grep -r "@reusable" src/

# Find code in specific domain
grep -r "@domain:users" src/
```

## Code Generation Guidelines

When generating new code:

1. **Always check ai-tags.md first** to use existing tags
2. **Infer tags from context:**
  - File path: `src/components/` → likely `@frontend`
  - File path: `src/api/` → likely `@api`
  - File path: `src/services/` → likely `@backend`
  - Task context: "login form" → `@feature:user-auth @domain:auth @frontend`

3. **Use 2-3 tags minimum** (feature + domain + layer)
4. **Add a @summary comment** describing what the code does
5. **Create new tags sparingly** - try to use existing ones first

## Tag Inference Rules

- **Controllers/Routes**: `@api` + relevant domain + feature
- **React Components**: `@frontend` + relevant domain + feature
- **Services/Business Logic**: `@backend` + relevant domain + feature
- **Database Models**: `@backend` + relevant domain
- **Utilities used across features**: `@reusable` or `@shared`
- **Configuration files**: `@shared` + relevant layer

## Examples

```javascript
// @feature:user-auth @domain:auth @frontend
// @summary: User authentication form with validation
export function LoginForm() {
  // component code here
}
```

```typescript
// @domain:users @backend
// @summary: User service for user management operations
export class UserService {
  // service code here
}
```

## Maintenance
- Update `ai-tags.md` when adding new tags
- Periodically review tags for consistency
- Remove unused tags from the reference file