// @feature:shared-types @domain:common @shared
// @summary: Common TypeScript type definitions for the proxy family project

export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string
  createdAt: Date
  updatedAt: Date
}

export interface RoutingRule {
  id: string
  domain: string
  action: 'DIRECT' | 'PROXY' | 'BLOCK'
  region?: string
  priority: number
  description?: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProxyEndpoint {
  id: string
  name: string
  url: string
  enabled: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

export interface FamilyProfile {
  id: string
  name: string
  userId: string
  restrictions?: string // JSON string
  allowedDomains?: string // JSON string
  blockedDomains?: string // JSON string
  createdAt: Date
  updatedAt: Date
}

export interface DeviceConfig {
  deviceId: string
  userId?: string
  workerConfig?: string // JSON string for WorkerConfig
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsData {
  id: string
  deviceId: string
  timestamp: Date
  totalRequests: number
  directCount: number
  proxyCount: number
  blockedCount: number
  domainStats?: string // JSON string for map[string]number
  createdAt: Date
}

// Auth session types
export interface Session {
  id: string
  expiresAt: Date
  token: string
  createdAt: Date
  updatedAt: Date
  ipAddress?: string
  userAgent?: string
  userId: string
}

export interface Account {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken?: string
  refreshToken?: string
  idToken?: string
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
  scope?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

export interface Verification {
  id: string
  identifier: string
  value: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}