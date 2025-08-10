// @feature:database-schemas @domain:database @shared
// @summary: Database schema definitions for clipboard synchronization system

import { boolean, integer, pgTable, text, timestamp, varchar, bigint, jsonb, serial } from 'drizzle-orm/pg-core'

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

// Clipboard Synchronization Tables
export const devices = pgTable('devices', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  deviceId: text('deviceId').notNull().unique(), // matches clipboard agent device ID
  name: text('name').notNull(), // user-friendly device name
  platform: text('platform').notNull(), // "linux", "darwin", "windows"
  ipAddress: text('ipAddress'), // for Tailscale integration
  userAgent: text('userAgent'),
  apiKey: text('apiKey').unique(), // long-lived API key for desktop app authentication
  verified: boolean('verified').notNull().default(false), // requires user verification on target device
  receiveUpdates: boolean('receiveUpdates').notNull().default(true), // toggle for receiving clipboard updates
  lastSeenAt: timestamp('lastSeenAt').notNull().defaultNow(),
  isActive: boolean('isActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const clipboardItems = pgTable('clipboardItems', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  deviceId: text('deviceId')
    .notNull()
    .references(() => devices.id, { onDelete: 'cascade' }),
  seq: serial('seq'), // auto-increment for synchronization ordering
  type: text('type').notNull(), // "text", "image", "file"
  mime: text('mime'), // content MIME type
  contentHash: text('contentHash').notNull(), // SHA-256 for deduplication (of encrypted content)
  sizeBytes: bigint('sizeBytes', { mode: 'number' }).notNull(),
  content: text('content'), // encrypted content (base64 encoded) for smaller items
  isEncrypted: boolean('isEncrypted').notNull().default(true), // whether content is encrypted
  encryptionAlgorithm: text('encryptionAlgorithm').default('AES-256-GCM'), // encryption algorithm used
  metadata: jsonb('metadata'), // width, height, etc.
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const clipboardFiles = pgTable('clipboardFiles', {
  id: text('id').primaryKey(),
  clipboardItemId: text('clipboardItemId')
    .notNull()
    .references(() => clipboardItems.id, { onDelete: 'cascade' }),
  content: text('content'), // base64 or text content for large items
  objectStorageUrl: text('objectStorageUrl'), // S3/storage URL for very large files
  compressionType: text('compressionType'), // "gzip", "brotli", null
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const wsTokens = pgTable('wsTokens', {
  token: text('token').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  deviceId: text('deviceId')
    .references(() => devices.id, { onDelete: 'cascade' }), // nullable for user-level tokens
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const pendingDeviceRegistrations = pgTable('pendingDeviceRegistrations', {
  token: text('token').primaryKey(), // device registration token (e.g., dev_linux-be_1754803752)
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  deviceIdPrefix: text('deviceIdPrefix').notNull(), // extracted prefix (e.g., linux-be)
  detectedDeviceId: text('detectedDeviceId'), // full device ID if detected (e.g., linux-bettie-1754802938-b299f18e15e044b0)
  detectedName: text('detectedName'), // detected hostname (e.g., bettie)
  detectedPlatform: text('detectedPlatform'), // detected platform (e.g., linux)
  userApproved: boolean('userApproved').default(false), // whether user has approved the device
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Re-export types for workspace imports
export * from './types'

