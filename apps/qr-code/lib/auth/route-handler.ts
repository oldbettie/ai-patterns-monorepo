import 'server-only'
import { auth, type Session, type User } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Types
type AppRouteHandlerFnContext = {
  params: Promise<{ [key: string]: string | string[] }>
}

type PublicAccessControlOptions = { isPublic: true }
type AuthorizedAccessControlOptions = {
  isPublic?: false
  isAuthenticated: true
}

type PublicHandler<
  T extends AppRouteHandlerFnContext = AppRouteHandlerFnContext,
> = (req: NextRequest, ctx: T) => Promise<NextResponse>

type AuthorizedHandler<
  T extends AppRouteHandlerFnContext = AppRouteHandlerFnContext,
> = (
  req: NextRequest & { user: User; session: Session['session'] },
  ctx: T
) => Promise<NextResponse>

// Helper function to get session
async function getSession() {
  return await auth.api.getSession({ headers: await headers() })
}

// Main route handler function overloads
export function createRouteHandler<
  T extends AppRouteHandlerFnContext = AppRouteHandlerFnContext,
>(
  accessControlOptions: PublicAccessControlOptions,
  handler: PublicHandler<T>
): PublicHandler<T>

export function createRouteHandler<
  T extends AppRouteHandlerFnContext = AppRouteHandlerFnContext,
>(
  accessControlOptions: AuthorizedAccessControlOptions,
  handler: AuthorizedHandler<T>
): PublicHandler<T>

export function createRouteHandler<
  T extends AppRouteHandlerFnContext = AppRouteHandlerFnContext,
>(
  accessControlOptions:
    | PublicAccessControlOptions
    | AuthorizedAccessControlOptions,
  handler: PublicHandler<T> | AuthorizedHandler<T>
) {
  return async (req: NextRequest, ctx: T) => {
    try {
      // Handle public routes
      if (accessControlOptions.isPublic) {
        return (handler as PublicHandler<T>)(req, ctx)
      }

      // Handle authenticated routes
      const session = await getSession()

      if (!session) {
        return NextResponse.json(
          { data: null, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Enhance request with user data
      const enhancedReq = Object.assign(req, {
        user: session.user,
        session: session.session,
      })

      return (handler as AuthorizedHandler<T>)(enhancedReq, ctx)
    } catch (error) {
      console.error('Route handler error:', error)
      return NextResponse.json(
        { data: null, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
