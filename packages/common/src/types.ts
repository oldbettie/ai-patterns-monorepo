// @feature:shared-types @domain:common @shared
// @summary: Common TypeScript type definitions for non-database shared types

// API Response wrapper types
export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
}

// Common status types
export type Status = 'online' | 'offline' | 'pending' | 'error'

// Common action types for routing
export type RoutingAction = 'DIRECT' | 'PROXY' | 'BLOCK'

// Device status for UI
export interface DeviceStatus {
  id: string
  name: string
  status: Status
  lastSeen: Date
}

// Connection status for logs/monitoring
export interface ConnectionStatus {
  id: string
  device: string
  profile: string
  startedAt: Date
  durationMin: number
  transferredMB: number
  status: 'ok' | 'dropped' | 'failed'
}

// Generic pagination types
export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Generic filter/search types
export interface SearchParams {
  query?: string
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}