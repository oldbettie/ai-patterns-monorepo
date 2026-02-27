import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    AUTH_SECRET: z.string().min(32),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_DOMAIN: z.string().min(1),
    POLAR_ACCESS_TOKEN: z.string().min(1).optional(),
    POLAR_WEBHOOK_SECRET: z.string().min(1).optional(),
    POLAR_PRODUCT_ID_SUPPORTER: z.string().min(1).optional(),
    POLAR_PRODUCT_ID_PLUS: z.string().min(1).optional(),
    POLAR_PRODUCT_ID_PRO: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_URL: z
      .string()
      .url()
      .default('http://dev-box:3000'),
    NEXT_PUBLIC_STAGE: z.enum(['local', 'dev', 'staging', 'prod']).default('local'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_STAGE: process.env.NEXT_PUBLIC_STAGE,
  },
})
