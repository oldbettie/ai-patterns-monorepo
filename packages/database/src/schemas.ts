// @feature:database-schemas @domain:database @shared
// @summary: Database schema definitions for proxy services

import { boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Proxy-specific tables
export const routingRules = pgTable('routing_rules', {
  id: text('id').primaryKey(),
  domain: varchar('domain', { length: 255 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(), // "DIRECT", "PROXY", "BLOCK"
  region: varchar('region', { length: 100 }), // "us-east", "uk-london", etc.
  priority: integer('priority').notNull().default(0),
  description: text('description'),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const proxyEndpoints = pgTable('proxy_endpoints', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 512 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  priority: integer('priority').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const familyProfiles = pgTable('family_profiles', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  restrictions: text('restrictions'), // JSON string
  allowedDomains: text('allowed_domains'), // JSON string
  blockedDomains: text('blocked_domains'), // JSON string
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Device configurations (corresponds to Go UserConfig)
export const deviceConfigs = pgTable('device_configs', {
  deviceId: text('device_id').primaryKey(),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' }),
  workerConfig: text('worker_config'), // JSON string for WorkerConfig
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Analytics data (corresponds to Go AnalyticsData)
export const analyticsData = pgTable('analytics_data', {
  id: text('id').primaryKey(),
  deviceId: text('device_id')
    .notNull()
    .references(() => deviceConfigs.deviceId, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp').notNull(),
  totalRequests: integer('total_requests').notNull().default(0),
  directCount: integer('direct_count').notNull().default(0),
  proxyCount: integer('proxy_count').notNull().default(0),
  blockedCount: integer('blocked_count').notNull().default(0),
  domainStats: text('domain_stats'), // JSON string for map[string]int64
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Family allow lists for VPN bypass applications
export const familyAllowLists = pgTable('family_allow_lists', {
  id: text('id').primaryKey(),
  familyId: text('family_id').notNull(), // Family identifier
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }), // Owner/manager of family
  allowedApplications: text('allowed_applications'), // JSON array of application names/paths
  presetMode: varchar('preset_mode', { length: 50 }).default('custom'), // "custom" | "privacy-first" | "gaming-optimized" | "balanced"
  listVersion: integer('list_version').notNull().default(1), // For desktop app sync
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Preset allow lists for default application configurations
export const presetAllowLists = pgTable('preset_allow_lists', {
  id: text('id').primaryKey(),
  modeName: varchar('mode_name', { length: 50 }).notNull(), // "privacy-first" | "gaming-optimized" | "balanced"
  applications: text('applications').notNull(), // JSON array of default applications for this mode
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Re-export types for workspace imports
export * from './types'

