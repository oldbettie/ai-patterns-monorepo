// @feature:donations @domain:donations @backend
// @summary: Server actions for donation API calls via secureFetch

'use server'

import { secureFetch } from '@/lib/serverUtils'
import type { ApiResponse } from '@quick-pdfs/common'
import type { DonorStatus } from '@quick-pdfs/common'

export async function getDonorStatusAction(): Promise<ApiResponse<DonorStatus>> {
  return secureFetch<ApiResponse<DonorStatus>>('/api/core/v1/donations')
}

export async function createDonationIntentAction(
  amount: number,
  currency = 'usd'
): Promise<ApiResponse<{ clientSecret: string; donationId: string }>> {
  return secureFetch<ApiResponse<{ clientSecret: string; donationId: string }>>(
    '/api/core/v1/donations',
    {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
