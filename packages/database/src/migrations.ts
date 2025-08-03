// @feature:database-migrations @domain:database @shared
// @summary: Database migration utilities and seeding functions

import postgres from 'postgres'

// Get database URL from environment
const getDatabaseUrl = () => {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL
  if (!url) {
    throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required')
  }
  return url
}

export interface Migration {
  version: string
  description: string
  up: string
  down: string
}

export const migrations: Migration[] = [
  {
    version: '001',
    description: 'Create initial tables',
    up: `
      CREATE TABLE users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'parent', 'child')),
        family_id VARCHAR(255) NOT NULL,
        profile_id VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE routing_rules (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        route_type VARCHAR(50) NOT NULL CHECK (route_type IN ('direct', 'proxy')),
        priority INTEGER NOT NULL DEFAULT 0,
        enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
    down: `
      DROP TABLE IF EXISTS routing_rules;
      DROP TABLE IF EXISTS users;
    `
  }
]

// Seed function for initial data
export async function seed() {
  const sql = postgres(getDatabaseUrl(), { 
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false 
  })

  // Create table with raw SQL for demo profiles
  const createTable = await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        image VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
  `
  
  const profiles = await Promise.all([
    sql`
          INSERT INTO profiles (name, email, image)
          VALUES ('Guillermo Rauch', 'rauchg@vercel.com', 'https://images.ctfassets.net/e5382hct74si/2P1iOve0LZJRZWUzfXpi9r/9d4d27765764fb1ad7379d7cbe5f1043/ucxb4lHy_400x400.jpg')
          ON CONFLICT (email) DO NOTHING;
      `,
    sql`
          INSERT INTO profiles (name, email, image)
          VALUES ('Lee Robinson', 'lee@vercel.com', 'https://images.ctfassets.net/e5382hct74si/4BtM41PDNrx4z1ml643tdc/7aa88bdde8b5b7809174ea5b764c80fa/adWRdqQ6_400x400.jpg')
          ON CONFLICT (email) DO NOTHING;
      `,
    sql`
          INSERT INTO profiles (name, email, image)
          VALUES ('Steven Tey', 'stey@vercel.com', 'https://images.ctfassets.net/e5382hct74si/4QEuVLNyZUg5X6X4cW4pVH/eb7cd219e21b29ae976277871cd5ca4b/profile.jpg')
          ON CONFLICT (email) DO NOTHING;
      `,
  ])

  return {
    createTable,
    insertedUsers: profiles,
  }
}