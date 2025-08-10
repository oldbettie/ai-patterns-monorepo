import { z } from "zod"

export const createClipboardItemSchema = z.object({
  deviceId: z.string().min(3),
  type: z.enum(["text", "image", "file"]),
  mime: z.string().optional(),
  content: z.string().min(1),
  contentHash: z.string().min(10),
  sizeBytes: z.number().int().nonnegative(),
  isEncrypted: z.boolean().default(true),
  encryptionAlgorithm: z.string().default('AES-256-GCM'),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const getSinceSchema = z.object({
  since: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().positive().max(200).optional(),
})

export const idParamSchema = z.object({ id: z.string().min(3) })

export type CreateClipboardItemInput = z.infer<typeof createClipboardItemSchema>

// Response types for dashboard
export interface ClipboardItemResponse {
  id: string
  seq: number
  type: 'text' | 'image' | 'file'
  mime?: string
  content?: string // May be encrypted
  contentHash: string
  sizeBytes: number
  isEncrypted: boolean
  encryptionAlgorithm?: string
  metadata?: Record<string, any>
  deviceId: string
  createdAt: string
}

export interface ClipboardFileResponse {
  id: string
  clipboardItemId: string
  content?: string // May be encrypted
  objectStorageUrl?: string
  compressionType?: string
  createdAt: string
}

export interface ClipboardItemWithContentResponse {
  item: ClipboardItemResponse
  file?: ClipboardFileResponse
}

// Dashboard-specific types for display
export interface DashboardClipboardItem {
  id: string
  type: 'text' | 'image' | 'file'
  createdAt: string
  preview: string // Decrypted preview for display
  deviceName: string
  devicePlatform: 'linux' | 'darwin' | 'windows' | 'ios' | 'android'
  sizeBytes?: number
  imageUrl?: string
  isEncrypted: boolean
  canDecrypt: boolean // Whether we can decrypt this item
  // Optional fields to support client-side decryption
  encryptedContent?: string // base64(nonce||ciphertext)
  encryptionAlgorithm?: string
  sourceDeviceId?: string // The agent deviceId used for key derivation
}

