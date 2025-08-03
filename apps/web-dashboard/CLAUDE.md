# CLAUDE.md - Instructions for AI Assistant

## Project Overview

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
1. **Services** - Business logic (e.g., `AuthService`, `ProductService`)
2. **Repositories** - Data access abstraction
3. **Validation** - Zod schemas in `lib/validationSchema/`
4. **Components** - Reusable UI in `components/`
5. **Hooks** - Custom React hooks in `components/hooks/`
5. **Actions** - Always using actions to call API routes to protect the API (`/actions`)

## Development Commands

### Testing
```bash
pnpm test          # Run Vitest tests
pnpm test:watch    # Run tests in watch mode
```

### Linting
```bash
pnpm lint          # Run ESLint
pnpm prettier-check # Check code formatting
pnpm prettier-fix  # Fix formatting issues
```

### Build
Never run a build without permission

### Development
⚠️ NEVER try to run the dev server yourself

## Testing Patterns
Black box testing with service layer testing mandatory

### Test Structure
- **Vitest** with TypeScript support
- **Mock repositories** for testing services
- **Test files** end with `.test.ts`
- **Setup** in `tests/domain/`

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
- **Radix UI** primitives with custom styling
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **TypeScript** interfaces for props

### Form Handling
- **React Hook Form** with Zod validation
- **Custom form components** in `components/form/`
- **Validation schemas** in `lib/validationSchema/`

## API Patterns

### Route Structure Example
```
app/(routes)/api/core/v<version_id>/
├── users/
├── products/
├── companies/
└── orders/
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
- **Authentication** middleware for frontend only. We never allow middleware auth on API calls to prevent midflight changes.

## Database Patterns

## Security Considerations

### Authentication
- **Better Auth** 
- **Session management**

### Authorization
- **Server-only** sensitive operations VERY IMPORTANT

## Common Tasks

### Adding New Features
1. Check `lib/featureToggles.ts` for feature flags
2. Create service in `lib/services/`
3. Add repository if needed
4. Create API routes
5. Build UI components
6. Add tests

### Working with Forms
1. Create Zod schema in `lib/validationSchema/`
2. Use React Hook Form with `@hookform/resolvers`
3. Create form components in `components/form/`
4. Handle submission with server actions or API calls

## Performance Considerations

### Next.js Optimization
- **Server components** by default
- **Client components** only when needed
- **Image optimization** with Next.js Image
- **Code splitting** with dynamic imports

### Caching Strategy
- **Tenant-specific** caching
- **Product catalog** caching
- **User session** caching

## Troubleshooting

### Common Issues
1. **Build failures** - Check TypeScript errors first
2. **Test failures** - Verify mock implementations
4. **Styling** - Ensure Tailwind classes are correct

### Debug Tools
- **Browser dev tools** for client-side debugging

## Important Notes

- **Never commit** secrets or API keys
- **Follow** the existing code patterns
- **Use feature toggles** for new features
- **Document** complex business logic
- **Prefer server components** over client components
- **Use TypeScript** strictly - no `any` types
- **Follow** the repository pattern for data access
- **Test** with both unit and integration tests


# AI MUST USE TOOLS

## AI Tagging System

## Overview
This project uses a structured tagging system to help AI assistants quickly find relevant code and maintain consistency across the codebase. Always check `ai-tags.md` for current tags before creating new ones.

## Core Tag Types
- **@feature:** - Specific feature being implemented (e.g., `@feature:user-profile`)
- **@domain:** - Business domain (e.g., `@domain:auth`, `@domain:payments`)
- **@backend** / **@api** / **@frontend** - System layer
- **@reusable** - Components/utilities that can be reused
- **@shared** - Code shared across multiple domains

## Tag Format
Add tags as comments at the top of files:

```javascript
// @feature:user-profile @domain:users @frontend
// @summary: User profile editing form with validation
```

```python
# @feature:user-auth @domain:auth @api
# @summary: Login endpoint with JWT token generation
```

## Finding Related Code
Use grep to search for tags when looking for related code:

```bash
# Find all user profile related code
grep -r "@feature:user-profile" src/

# Find frontend authentication code
grep -r "@domain:auth.*@frontend" src/

# Find all reusable components
grep -r "@reusable" src/

# Find code in specific domain
grep -r "@domain:payments" src/
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
// @feature:user-profile @domain:users @frontend
// @summary: User profile editing form with validation
export function UserProfileForm() {
  // component code here
}
```

```sql
-- @domain:users @backend
-- @summary: User profile data table
CREATE TABLE user_profiles (
    -- schema here
);
```

## Maintenance
- Update `ai-tags.md` when adding new tags
- Periodically review tags for consistency
- Remove unused tags from the reference file
