// @feature:donations @domain:donations @api
// @summary: Stripe webhook handler for payment intent events

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createDonationRepository } from '@quick-pdfs/database/src/repositories/donationRepository'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-01-28.clover',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook verification failed: ${message}` }, { status: 400 })
  }

  const donationRepository = createDonationRepository()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const donation = await donationRepository.findByStripePaymentId(pi.id)
      if (donation) {
        await donationRepository.updateStatus(donation.id, 'completed')
      }
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const donation = await donationRepository.findByStripePaymentId(pi.id)
      if (donation) {
        await donationRepository.updateStatus(donation.id, 'failed')
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
