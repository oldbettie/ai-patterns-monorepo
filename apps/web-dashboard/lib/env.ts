import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().min(1),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    BETTER_AUTH_SECRET: z.string().min(32),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_DOMAIN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z
      .string()
      .url()
      .default('http://localhost:3000'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  },
})
