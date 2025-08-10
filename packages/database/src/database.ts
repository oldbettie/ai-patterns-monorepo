// @feature:database-connection @domain:database @backend
// @summary: Server-only database connection and configuration

import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// Get database URL from environment
const getDatabaseUrl = () => {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!url) {
    throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required')
  }
  return url
}

const sql = postgres(getDatabaseUrl(), {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
})

// Connect to Postgres (server-only)
export const db = drizzle(sql)

export type DB = typeof db