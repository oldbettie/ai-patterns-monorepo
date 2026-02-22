// @feature:donations @domain:donations @api
// @summary: Donations API — GET donor status

import { NextResponse } from 'next/server'
import { createRouteHandler } from '@/lib/auth/route-handler'
import { createDonationService } from '@/lib/services/donationService'
import { FeatureToggles } from '@/lib/config/featureToggles'

export const GET = createRouteHandler({ isAuthenticated: true }, async req => {
  if (!FeatureToggles.enableDonations) {
    return NextResponse.json({ data: null, error: 'Donations are currently disabled' }, { status: 403 })
  }
  const donationService = createDonationService(req)
  const status = await donationService.getDonorStatus()
  return NextResponse.json({ data: status, error: null })
})
