// @feature:database-config @domain:database @shared
// @summary: Drizzle configuration for database migrations and schema management

import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// Load environment variables from .env.local at project root
config({ path: '../../.env.local' })

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schemas.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
