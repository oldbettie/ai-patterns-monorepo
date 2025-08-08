// @feature:allow-list @domain:allow-list @backend
// @summary: Service types for allow list functionality

export interface ServiceContext {
  userId: string
  familyId: string
}

export type PresetMode = 'privacy-first' | 'gaming-optimized' | 'balanced'

export interface BulkOperationRequest {
  action: 'add' | 'remove'
  applications: string[]
}
