// @feature:pattern-docs @domain:marketing @frontend
// @summary: Architecture patterns documentation page explaining DDD and AI-friendly development

import { getTranslations } from 'next-intl/server'
import Container from '@/components/ui/Container'
import SectionHeading from '@/components/ui/SectionHeading'
import Button from '@/components/ui/Button'
import CodeBlock from '@/components/ui/CodeBlock'

export const metadata = {
  title: 'Why Patterns Matter',
  description:
    'Learn about the architecture patterns that make this template AI-friendly and maintainable.',
}

export default async function WhyPage() {
  const t = await getTranslations('pages.why')

  return (
    <main className='relative min-h-screen overflow-x-hidden'>
      {/* Background layers */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1000px_500px_at_50%_-200px,rgba(0,0,0,0.03),transparent)] dark:bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(255,255,255,0.06),transparent_60%)]'
      />

      {/* Hero Section */}
      <section className='pt-28 pb-16 md:pt-36 md:pb-24'>
        <Container className='text-center'>
          <div className='inline-flex items-center rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-600 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300'>
            {t('hero.eyebrow')}
          </div>
          <h1 className='mt-5 text-neutral-900 text-4xl font-semibold tracking-tight md:text-6xl dark:text-neutral-50'>
            {t('hero.title')}
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-neutral-700 md:text-lg dark:text-neutral-300'>
            {t('hero.subtitle')}
          </p>
        </Container>
      </section>

      {/* Introduction */}
      <section className='py-8'>
        <Container>
          <div className='mx-auto max-w-3xl rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30'>
            <h2 className='text-xl font-semibold text-amber-900 dark:text-amber-100'>
              {t('intro.title')}
            </h2>
            <p className='mt-2 text-amber-800 dark:text-amber-200'>
              {t('intro.body')}
            </p>
          </div>
        </Container>
      </section>

      {/* Pattern 1: Service/Repository */}
      <section className='py-12'>
        <Container>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-50'>
              {t('patterns.serviceRepo.title')}
            </h2>
            <p className='mt-2 text-neutral-700 dark:text-neutral-300'>
              {t('patterns.serviceRepo.description')}
            </p>
            <div className='mt-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30'>
              <p className='text-sm text-blue-900 dark:text-blue-200'>
                <strong>Why this matters:</strong> {t('patterns.serviceRepo.why')}
              </p>
            </div>

            <div className='mt-6 space-y-4'>
              <CodeBlock
                filename='lib/services/userService.ts'
                language='typescript'
                code={`export class UserService {
  private readonly userRepository: UserRepository
  private readonly context: ServiceContext

  constructor(
    userRepository: UserRepository,
    context: ServiceContext
  ) {
    this.userRepository = userRepository
    this.context = context
  }

  async updateUserSettings(userId: string, data: UpdateUserSettingsInput) {
    // Business logic: Authorization check
    if (userId !== this.context.user.id) {
      throw new Error('Unauthorized')
    }

    // Business logic: Email uniqueness validation
    if (data.email && data.email !== this.context.user.email) {
      const existingUser = await this.userRepository.getUserByEmail(data.email)
      if (existingUser) {
        throw new Error('Email already in use')
      }
    }

    // Delegate data access to repository
    return await this.userRepository.updateUser(userId, data)
  }
}`}
              />

              <CodeBlock
                filename='packages/database/src/repositories/userRepository.ts'
                language='typescript'
                code={`export class UserRepository {
  constructor(private readonly db: DB) {}

  async getUserById(userId: string) {
    const result = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    return result[0] || null
  }

  async updateUser(userId: string, data: UpdateUserInput) {
    const result = await this.db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning()

    return result[0] || null
  }
}`}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Pattern 2: Type-Safe API Routes */}
      <section className='py-12 bg-neutral-50 dark:bg-neutral-950/50'>
        <Container>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-50'>
              {t('patterns.apiRoutes.title')}
            </h2>
            <p className='mt-2 text-neutral-700 dark:text-neutral-300'>
              {t('patterns.apiRoutes.description')}
            </p>
            <div className='mt-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30'>
              <p className='text-sm text-blue-900 dark:text-blue-200'>
                <strong>Why this matters:</strong> {t('patterns.apiRoutes.why')}
              </p>
            </div>

            <div className='mt-6 space-y-4'>
              <CodeBlock
                filename='lib/auth/route-handler.ts'
                language='typescript'
                code={`// Type-safe wrapper with authentication built-in
export function createRouteHandler<T>(
  accessControlOptions: AuthorizedAccessControlOptions,
  handler: AuthorizedHandler<T>
): PublicHandler<T>

// Usage ensures type safety and consistent auth
export function createRouteHandler<T>(
  accessControlOptions: PublicAccessControlOptions,
  handler: PublicHandler<T>
): PublicHandler<T>`}
              />

              <CodeBlock
                filename='app/(routes)/api/core/v1/users/route.ts'
                language='typescript'
                code={`export const GET = createRouteHandler(
  { isAuthenticated: true },
  async (req) => {
    // req.user and req.session are automatically typed and validated
    const userService = createUserService({ user: req.user })
    const data = await userService.getUserDataSummary()

    return NextResponse.json({ data, error: null })
  }
)

export const DELETE = createRouteHandler(
  { isAuthenticated: true },
  async (req) => {
    const userService = createUserService({ user: req.user })
    await userService.deleteAllUserData()

    return NextResponse.json({ data: null, error: null })
  }
)`}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Pattern 3: Secure Fetch */}
      <section className='py-12'>
        <Container>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-50'>
              {t('patterns.secureFetch.title')}
            </h2>
            <p className='mt-2 text-neutral-700 dark:text-neutral-300'>
              {t('patterns.secureFetch.description')}
            </p>
            <div className='mt-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30'>
              <p className='text-sm text-blue-900 dark:text-blue-200'>
                <strong>Why this matters:</strong> {t('patterns.secureFetch.why')}
              </p>
            </div>

            <div className='mt-6 space-y-4'>
              <CodeBlock
                filename='lib/serverUtils.ts'
                language='typescript'
                code={`export async function secureFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  // Automatically validate session
  const headersList = await headers()
  const session = await auth.api.getSession({ headers: headersList })

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Forward cookies and filtered headers
  const filteredHeaders = Object.fromEntries(
    Array.from(headersList.entries()).filter(
      ([key]) => !headersToExclude.has(key.toLowerCase())
    )
  )

  const response = await fetch(\`\${getBaseUrl()}\${input}\`, {
    ...init,
    headers: {
      ...filteredHeaders,
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    throw new Error(\`Fetch failed: \${response.status}\`)
  }

  return response.json()
}`}
              />

              <CodeBlock
                filename='actions/user-actions.ts'
                language='typescript'
                code={`'use server'

export async function deleteUserAccount() {
  try {
    // secureFetch automatically handles authentication
    await secureFetch('/api/core/v1/users', {
      method: 'DELETE',
    })

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}`}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Pattern 4: Centralized Validation */}
      <section className='py-12 bg-neutral-50 dark:bg-neutral-950/50'>
        <Container>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-50'>
              {t('patterns.validation.title')}
            </h2>
            <p className='mt-2 text-neutral-700 dark:text-neutral-300'>
              {t('patterns.validation.description')}
            </p>
            <div className='mt-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30'>
              <p className='text-sm text-blue-900 dark:text-blue-200'>
                <strong>Why this matters:</strong> {t('patterns.validation.why')}
              </p>
            </div>

            <div className='mt-6'>
              <CodeBlock
                filename='lib/services/userService.ts'
                language='typescript'
                code={`import { z } from 'zod'

// Define schema with validation rules
export const updateUserSettingsSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional().nullable(),
})

// TypeScript type automatically inferred from schema
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>

// Use in service with full type safety
export class UserService {
  async updateUserSettings(userId: string, data: UpdateUserSettingsInput) {
    // data is fully typed, validation happens at runtime
    const validated = updateUserSettingsSchema.parse(data)
    return await this.userRepository.updateUser(userId, validated)
  }
}`}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Pattern 5: Database Layer */}
      <section className='py-12'>
        <Container>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-50'>
              {t('patterns.database.title')}
            </h2>
            <p className='mt-2 text-neutral-700 dark:text-neutral-300'>
              {t('patterns.database.description')}
            </p>
            <div className='mt-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30'>
              <p className='text-sm text-blue-900 dark:text-blue-200'>
                <strong>Why this matters:</strong> {t('patterns.database.why')}
              </p>
            </div>

            <div className='mt-6 space-y-4'>
              <CodeBlock
                filename='packages/database/src/schemas.ts'
                language='typescript'
                code={`import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expiresAt').notNull(),
})`}
              />

              <CodeBlock
                filename='packages/database/src/repositories/userRepository.ts'
                language='typescript'
                code={`import { eq } from 'drizzle-orm'
import { user } from '../schemas'

export class UserRepository {
  constructor(private readonly db: DB) {}

  // Fully typed query with IntelliSense
  async getUserById(userId: string) {
    const result = await this.db
      .select()
      .from(user)  // Type-safe table reference
      .where(eq(user.id, userId))  // Type-safe column reference
      .limit(1)

    // Result is fully typed based on schema
    return result[0] || null
  }
}`}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Pattern 6: Testing */}
      <section className='py-12 bg-neutral-50 dark:bg-neutral-950/50'>
        <Container>
          <div className='mx-auto max-w-4xl'>
            <h2 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-50'>
              {t('patterns.testing.title')}
            </h2>
            <p className='mt-2 text-neutral-700 dark:text-neutral-300'>
              {t('patterns.testing.description')}
            </p>
            <div className='mt-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30'>
              <p className='text-sm text-blue-900 dark:text-blue-200'>
                <strong>Why this matters:</strong> {t('patterns.testing.why')}
              </p>
            </div>

            <div className='mt-6'>
              <CodeBlock
                filename='lib/services/userService.test.ts'
                language='typescript'
                code={`describe('UserService', () => {
  const createTestService = () => {
    // Mock repository for isolated testing
    const mockUserRepo = {
      getUserById: vi.fn(),
      getUserByEmail: vi.fn(),
      updateUser: vi.fn(),
    }

    const context = {
      user: { id: 'user-123', email: 'test@example.com' }
    }

    const service = new UserService(mockUserRepo, context)
    return { service, mockUserRepo }
  }

  it('should prevent users from updating other users', async () => {
    const { service } = createTestService()

    // Test business logic without database
    await expect(
      service.updateUserSettings('other-user-id', { name: 'New Name' })
    ).rejects.toThrow('Unauthorized')
  })

  it('should validate email uniqueness', async () => {
    const { service, mockUserRepo } = createTestService()

    // Mock repository response
    mockUserRepo.getUserByEmail.mockResolvedValue({ id: 'other-user' })

    await expect(
      service.updateUserSettings('user-123', { email: 'taken@example.com' })
    ).rejects.toThrow('Email already in use')
  })
})`}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className='py-16 md:py-24'>
        <Container>
          <div className='rounded-2xl border border-neutral-300 bg-white p-8 shadow-sm backdrop-blur md:p-12 dark:border-neutral-800 dark:bg-neutral-900/80'>
            <div className='mx-auto max-w-2xl text-center'>
              <h3 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
                Ready to build with confidence?
              </h3>
              <p className='mt-2 text-neutral-600 dark:text-neutral-300'>
                Start with proven patterns and let AI help you scale faster.
              </p>
              <div className='mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center'>
                <Button href='/signup'>{t('navigation.getStarted')}</Button>
                <Button href='/' variant='secondary'>
                  {t('navigation.backHome')}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer Navigation */}
      <footer className='pb-10 pt-6'>
        <Container className='flex flex-col items-center justify-center gap-4 text-sm text-neutral-600 md:flex-row dark:text-neutral-500'>
          <span>&copy; {new Date().getFullYear()} Better-Stack Template</span>
        </Container>
      </footer>
    </main>
  )
}
