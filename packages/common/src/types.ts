// @feature:shared-types @domain:common @shared
// @summary: Common TypeScript type definitions for non-database shared types

// API Response wrapper types
export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
}

// Common status types
export type Status = 'online' | 'offline' | 'pending' | 'error'

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
  filters?: Record<string, string | number | boolean>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// PDF Editor types
export interface TextElement {
  id: string
  pageIndex: number
  x: number
  y: number
  text: string
  fontFamily: string
  fontSize: number
  color: string
}

export interface SignatureData {
  id: string
  pageIndex: number
  x: number
  y: number
  width: number
  height: number
  signatureId: string
}

export interface StoredSignature {
  id: string
  name: string
  imageData: string
  createdAt: number
}

export interface PDFDocument {
  id: string
  name: string
  originalFile: Blob
  modifiedFile: Blob | null
  thumbnail: string | null
  pageCount: number
  fileSize: number
  textElements: TextElement[]
  signatureData: SignatureData[]
  createdAt: number
  updatedAt: number
}

export interface AppState {
  id: 'singleton'
  hasSeenWelcome: boolean
  donorStatus: boolean
  donorStatusSyncedAt: number | null
}

export type DonorStatus = { isDonor: boolean; expiresAt: string | null }