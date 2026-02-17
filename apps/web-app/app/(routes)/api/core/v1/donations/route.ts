// @feature:donations @domain:donations @api
// @summary: Donations API — GET donor status, POST create payment intent

import { NextResponse } from 'next/server'
import { createRouteHandler } from '@/lib/auth/route-handler'
import { createDonationService } from '@/lib/services/donationService'
import { createDonationSchema } from '@/lib/validationSchema/donationSchema'

export const GET = createRouteHandler({ isAuthenticated: true }, async req => {
  const donationService = createDonationService(req)
  const status = await donationService.getDonorStatus()
  return NextResponse.json({ data: status, error: null })
})

export const POST = createRouteHandler({ isAuthenticated: true }, async req => {
  try {
    const body = await req.json()
    const input = createDonationSchema.parse(body)
    const donationService = createDonationService(req)
    const result = await donationService.createPaymentIntent(input)
    return NextResponse.json({ data: result, error: null })
  } catch (error: unknown) {
    console.error('POST /api/core/v1/donations error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create payment intent'
    return NextResponse.json({ data: null, error: message }, { status: 400 })
  }
})
