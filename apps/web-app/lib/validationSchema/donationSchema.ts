// @feature:donations @domain:donations @backend
// @summary: Zod validation schema for donation creation

import { z } from 'zod'

export const createDonationSchema = z.object({
  amount: z.number().int().min(100),
  currency: z.string().default('usd'),
})

export type CreateDonationInput = z.infer<typeof createDonationSchema>
