import { account, db, session, user, verification } from '@proxy-fam/database'
import { env } from '@/lib/env'
import { EmailService } from '@/lib/resend/email-service'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Resend } from 'resend'

// TODO: Test this.
// TODO: Implement front end pages and interactions when these emails are to be sent or accepted/rejected
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
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
    sendOnSignUp: true,
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
