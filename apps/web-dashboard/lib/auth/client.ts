'use client'

import { env } from '@/lib/env'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_URL,
  // Configure client to work with JWT tokens
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },
  emailAndPassword: {
    enabled: true,
  },
})

export const { signIn, signUp, signOut, useSession } = authClient

export function useUser() {
  const { data: session } = useSession()

  return {
    user: session ? session.user : null,
    isAuthenticated: !!session,
  }
}
