// @domain:config @feature:routes
// @summary: Centralized route configuration for AppRoutes and ApiRoutes

/**
 * Application routes for frontend navigation
 * Use these constants instead of hardcoded strings to ensure type safety and easier refactoring
 */
export const AppRoutes = {
  // Public routes
  home: '/',
  why: '/why',
  login: '/login',
  signup: '/signup',
  
  // Auth routes
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
  verifyEmailSuccess: '/auth/verify-email/success',
  
  // Authenticated routes
  dashboard: '/dashboard',
  donate: '/donate',
  donateSuccess: '/donate/success',
  
  // Editor routes
  editor: '/editor',
} as const

/**
 * API routes for server-side communication
 * Use these constants with secureFetch or publicFetch
 */
export const ApiRoutes = {
  // Auth API
  auth: '/api/auth',
  
  // Core API v1
  users: '/api/core/v1/users',
  donations: '/api/core/v1/donations',
  
  // Webhooks
  stripeWebhook: '/api/webhooks/stripe',
} as const

// Type exports for type safety
export type AppRoute = typeof AppRoutes[keyof typeof AppRoutes]
export type ApiRoute = typeof ApiRoutes[keyof typeof ApiRoutes]
