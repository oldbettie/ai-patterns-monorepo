// @feature:donations @domain:donations @backend
// @summary: Server actions for donation API calls via secureFetch

'use server'

import { secureFetch } from '@/lib/serverUtils'
import type { ApiResponse } from '@quick-pdfs/common'
import type { DonorStatus } from '@quick-pdfs/common'
import { FeatureToggles } from '@/lib/config/featureToggles'

export async function getDonorStatusAction(): Promise<ApiResponse<DonorStatus>> {
  if (!FeatureToggles.enableDonations) {
    return { data: null, error: 'Donations are currently disabled' }
  }
  return secureFetch<ApiResponse<DonorStatus>>('/api/core/v1/donations')
}
