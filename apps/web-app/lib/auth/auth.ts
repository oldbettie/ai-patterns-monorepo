import { account, session, user, verification } from '@better-stack-monorepo/database/src/schemas'
import { db } from '@better-stack-monorepo/database/src/database'
import { env } from '@/lib/env'
import { FeatureConfig } from '@/lib/config/featureToggles'
import { EmailService } from '@/lib/resend/email-service'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Resend } from 'resend'

const emailService = new EmailService(new Resend(env.RESEND_API_KEY))

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  secret: env.AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: FeatureConfig.features.emailVerification,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({
      user,
      url,
    }: {
      user: { email: string }
      url: string
    }) => {
      await emailService.sendPasswordResetEmail({
        email: user.email,
        resetUrl: url,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string }
      url: string
    }) => {
      await emailService.sendVerificationEmail({
        email: user.email,
        verificationUrl: url,
      })
    },
    sendOnSignUp: FeatureConfig.features.emailVerification,
    autoSignInAfterVerification: true,
    expiresIn: 24 * 60 * 60, // 24 hours
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every day the session will be updated)
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // Same as session expiry
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
