import { z } from "zod"

export const generateWsTokenSchema = z.object({
  deviceId: z.string().optional(),
})

export const tokenParamSchema = z.object({
  token: z.string().min(10),
})

