import { env } from '@/lib/env'

type FeatureToggles = {
  features: {
    emailVerification: boolean
  }
}

const ProdFeatureToggles: FeatureToggles = {
  features: {
    emailVerification: true,
  },
}

const DevFeatureToggles: FeatureToggles = {
  features: {
    emailVerification: false,
  },
}

export const FeatureConfig: FeatureToggles = (() => {
  if (env.NODE_ENV === 'production') {
    return ProdFeatureToggles
  }
  return DevFeatureToggles
})()

/**
 * Centralized app routes to avoid magic strings across the codebase.
 */
export const AppRoutes = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
}

/**
 * Centralized API routes to avoid magic strings in server actions.
 */
export const ApiRoutes = {
  users: {
    current: '/api/core/v1/users',
  },
}
