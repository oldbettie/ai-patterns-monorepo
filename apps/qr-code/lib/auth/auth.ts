import { account, session, user, verification } from '@quick-pdfs/database/src/schemas'
import { db } from '@quick-pdfs/database/src/database'
import { env } from '@/lib/env'
import { FeatureToggles } from '@/lib/config/featureToggles'
import { EmailService } from '@/lib/resend/email-service'
import { betterAuth, type BetterAuthPlugin } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Resend } from 'resend'
import { polar, checkout, portal, webhooks } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'
import { createDonationRepository } from '@quick-pdfs/database/src/repositories/donationRepository'

const PRO_AMOUNT = 2500
const PLUS_AMOUNT = 1000
const SUPPORTER_AMOUNT = 500

const emailService = new EmailService(new Resend(env.RESEND_API_KEY))

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN ?? '',
  server: env.NEXT_PUBLIC_STAGE === 'prod' ? 'production' : 'sandbox',
})

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
    requireEmailVerification: FeatureToggles.requireEmailVerification,
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
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            { productId: env.POLAR_PRODUCT_ID_SUPPORTER ?? '', slug: 'donate-supporter' }, // $5 basic supporter
            { productId: env.POLAR_PRODUCT_ID_PLUS ?? '', slug: 'donate-plus' }, // $10 plus supporter
            { productId: env.POLAR_PRODUCT_ID_PRO ?? '', slug: 'donate-pro' }, // $25 pro supporter
          ],
          successUrl: `${env.NEXT_PUBLIC_URL}/donate/success?checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET ?? '',
          onOrderPaid: async (payload) => {
            const donationRepo = createDonationRepository()
            const userId = payload.data.customer.externalId
            if (!userId) return

            // Map Polar product to donation tier by product ID
            const amount = payload.data.items?.[0]?.amount ?? 0

            console.log('amount', amount)
            const tier =
              amount === PRO_AMOUNT
                ? 'supporter_pro'
                : amount === PLUS_AMOUNT
                  ? 'supporter_plus'
                  : 'supporter'

            await donationRepo.create({
              id: crypto.randomUUID(),
              userId,
              amount: payload.data.totalAmount,
              currency: payload.data.currency.toLowerCase(),
              status: 'completed',
              polarOrderId: payload.data.id,
              tier,
              donatedAt: new Date(payload.data.createdAt),
              expiresAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          },
        }),
      ],
    }) as unknown as BetterAuthPlugin,
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
