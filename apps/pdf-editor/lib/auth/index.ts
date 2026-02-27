/**
 * Better Auth Module - Client-side exports only
 *
 * This module provides Better Auth integration for:
 * - Frontend authentication (login/logout/session management)
 *
 * For server-side auth, import directly from:
 * - lib/auth/auth (for server-side auth instance)
 * - lib/auth/server (for middleware and server-side session verification)
 *
 * For API routes, use lib/api-auth instead to ensure JWT consistency
 * and prevent mid-flight auth changes.
 */

// Client-side Better Auth only
export {
  authClient,
  signIn,
  signUp,
  signOut,
  useSession,
  useUser,
} from './client'

// Export types only (these don't pull in server code)
export type { Session, User } from './auth'
