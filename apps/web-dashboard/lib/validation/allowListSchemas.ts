// @feature:allow-list @domain:validation @shared
// @summary: Zod validation schemas for allow list API inputs

import { z } from 'zod'

// Application name validation
export const applicationNameSchema = z
  .string()
  .min(1, 'Application name cannot be empty')
  .max(255, 'Application name cannot exceed 255 characters')
  .trim()

// Applications array validation
export const applicationsArraySchema = z
  .array(applicationNameSchema)
  .min(1, 'Applications array cannot be empty')
  .max(100, 'Cannot process more than 100 applications at once')

// Preset mode validation
export const presetModeSchema = z.enum(['privacy-first', 'gaming-optimized', 'balanced'], {
  message: 'Preset mode must be one of: privacy-first, gaming-optimized, balanced',
})

// Bulk operation action validation
export const bulkActionSchema = z.enum(['add', 'remove'], {
  message: 'Action must be either "add" or "remove"',
})

// Schema for updating entire allow list
export const updateAllowListSchema = z.object({
  applications: applicationsArraySchema.optional(),
})

// Schema for applying preset mode
export const applyPresetModeSchema = z.object({
  mode: presetModeSchema,
})

// Schema for single application operations
export const singleApplicationSchema = z.object({
  application: applicationNameSchema,
})

// Schema for bulk operations
export const bulkOperationSchema = z.object({
  action: bulkActionSchema,
  applications: applicationsArraySchema,
})

// Schema for custom allow list (manual applications input)
export const customAllowListSchema = z.object({
  applications: z
    .array(applicationNameSchema)
    .max(500, 'Cannot have more than 500 applications in allow list'),
})

// Type exports for use in API routes
export type UpdateAllowListRequest = z.infer<typeof updateAllowListSchema>
export type ApplyPresetModeRequest = z.infer<typeof applyPresetModeSchema>
export type SingleApplicationRequest = z.infer<typeof singleApplicationSchema>
export type BulkOperationRequest = z.infer<typeof bulkOperationSchema>
export type CustomAllowListRequest = z.infer<typeof customAllowListSchema>