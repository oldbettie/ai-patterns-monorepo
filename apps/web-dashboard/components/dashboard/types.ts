export type Device = {
  id: string
  deviceId: string
  name: string
  platform: string
  ipAddress: string | null
  verified: boolean
  receiveUpdates: boolean
  isActive: boolean
  lastSeenAt: string
  createdAt: string
  updatedAt: string
}

export type ClipboardItem = {
  id: string
  type: 'text' | 'image' | 'file'
  createdAt: string
  preview: string
}

export type ClipboardRow = {
  id: string
  type: 'text' | 'image' | 'file'
  createdAt: string
  preview: string
  deviceName: string
  devicePlatform: 'linux' | 'darwin' | 'windows' | 'ios' | 'android'
  sizeBytes?: number
  imageUrl?: string
  isEncrypted?: boolean
  canDecrypt?: boolean
  // Optional fields to support client-side decryption
  encryptedContent?: string
  encryptionAlgorithm?: string
  sourceDeviceId?: string
}

export type User = {
  id: string
  name: string | null
  email: string | null
  createdAt: string
}

