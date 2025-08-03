// @feature:database-config @domain:database @shared
// @summary: Drizzle configuration for database migrations and schema management

import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// Load environment variables from .env.local at project root
config({ path: '../../.env.local' })

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schemas.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
})
