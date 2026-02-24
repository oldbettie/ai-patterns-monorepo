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
    FROM_EMAIL: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_URL: z
      .string()
      .url()
      .default('http://localhost:3000'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  },
})
