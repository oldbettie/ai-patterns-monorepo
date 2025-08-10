import { z } from "zod"

export const registerDeviceSchema = z.object({
  deviceId: z.string().min(3),
  name: z.string().min(1),
  platform: z.enum(["linux", "darwin", "windows"]),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string().optional().nullable(),
})

export const renameDeviceSchema = z.object({
  name: z.string().min(1),
})

export const toggleUpdatesSchema = z.object({
  receiveUpdates: z.boolean(),
})

export const verifyDeviceSchema = z.object({
  token: z.string().min(1),
})

export const manualAddDeviceSchema = z.object({
  name: z.string().min(1),
  ipAddress: z.string().optional().nullable(),
  tailscaleName: z.string().optional().nullable(),
  platform: z.enum(["linux", "darwin", "windows"]).optional(),
  isManual: z.boolean().optional(),
})

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>
export type RenameDeviceInput = z.infer<typeof renameDeviceSchema>
export type ToggleUpdatesInput = z.infer<typeof toggleUpdatesSchema>
export type VerifyDeviceInput = z.infer<typeof verifyDeviceSchema>
export type ManualAddDeviceInput = z.infer<typeof manualAddDeviceSchema>

