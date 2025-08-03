import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '../../.env.local' })

export default defineConfig({
  dialect: 'postgresql',
  schema: './schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
})
