// @domain:config @feature:feature-toggles @shared
// @summary: Environment-specific feature toggle configuration

import { env } from '@/lib/env'

type FeatureToggleConfig = {
  enableLogin: boolean
  enableSignup: boolean
  enablePolar: boolean
  enableDonations: boolean
  enableDonateBanner: boolean
  requireEmailVerification: boolean
}

export const isProd = env.NEXT_PUBLIC_STAGE === 'prod'

const ProdFeatureToggles: FeatureToggleConfig = {
  enableLogin: false,
  enableSignup: false,
  enablePolar: false,
  enableDonations: false,
  enableDonateBanner: false,
  requireEmailVerification: true,
}

const StagingFeatureToggles: FeatureToggleConfig = {
  enableLogin: true,
  enableSignup: true,
  enablePolar: true,
  enableDonations: true,
  enableDonateBanner: true,
  requireEmailVerification: true,
}

const DevFeatureToggles: FeatureToggleConfig = {
  enableLogin: true,
  enableSignup: true,
  enablePolar: true,
  enableDonations: true,
  enableDonateBanner: true,
  requireEmailVerification: false,
}

const LocalFeatureToggles: FeatureToggleConfig = {
  enableLogin: true,
  enableSignup: true,
  enablePolar: true,
  enableDonations: true,
  enableDonateBanner: true,
  requireEmailVerification: true,
}

export const FeatureToggles: FeatureToggleConfig = (() => {
  if (isProd) {
    return ProdFeatureToggles
  } else if (env.NEXT_PUBLIC_STAGE === 'staging') {
    return StagingFeatureToggles
  } else if (env.NEXT_PUBLIC_STAGE === 'dev') {
    return DevFeatureToggles
  } else {
    console.log(
      'Using local feature config. Check featureToggles.ts to adjust feature toggle values'
    )
    return LocalFeatureToggles
  }
})()

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
  dashboard: '/generate',
  profile: '/profile',
  donate: '/donate',
  donateSuccess: '/donate/success',

  // QR tool routes
  generate: '/generate',
  generateUrl: '/generate/url',
  generateWifi: '/generate/wifi',
  generateVcard: '/generate/vcard',
  generateSms: '/generate/sms',
  generateEmail: '/generate/email',
  generateText: '/generate/text',

  // SEO/misc
  privacy: '/privacy',
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

} as const

// Type exports for type safety
export type AppRoute = typeof AppRoutes[keyof typeof AppRoutes]
export type ApiRoute = typeof ApiRoutes[keyof typeof ApiRoutes]
