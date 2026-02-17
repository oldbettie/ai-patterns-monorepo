// @feature:donations @domain:donations @backend
// @summary: Donation service handling Stripe payment intents and donor status

import 'server-only'

import Stripe from 'stripe'
import { DonationRepository } from '@quick-pdfs/database/src/repositories/donationRepository'
import { db } from '@quick-pdfs/database/src/database'
import type { ServiceContext } from '@/lib/types'
import type { CreateDonationInput } from '@/lib/validationSchema/donationSchema'
import type { DonorStatus } from '@quick-pdfs/common'

export class DonationService {
  private readonly stripe: Stripe

  constructor(
    private readonly donationRepository: DonationRepository,
    private readonly context: ServiceContext
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2026-01-28.clover',
    })
  }

  async createPaymentIntent(input: CreateDonationInput): Promise<{ clientSecret: string; donationId: string }> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency,
      metadata: { userId: this.context.user.id },
    })

    const donation = await this.donationRepository.create({
      id: crypto.randomUUID(),
      userId: this.context.user.id,
      amount: input.amount,
      currency: input.currency,
      status: 'pending',
      stripePaymentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      donatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      clientSecret: paymentIntent.client_secret ?? '',
      donationId: donation.id,
    }
  }

  async getDonorStatus(): Promise<DonorStatus> {
    const donations = await this.donationRepository.findByUserId(this.context.user.id)
    const completed = donations.filter(d => d.status === 'completed')
    const isDonor = completed.length > 0

    const latest = completed.sort((a, b) =>
      new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime()
    )[0]

    return {
      isDonor,
      expiresAt: latest?.expiresAt ? new Date(latest.expiresAt).toISOString() : null,
    }
  }

  async markDonationCompleted(stripePaymentId: string): Promise<void> {
    const donation = await this.donationRepository.findByStripePaymentId(stripePaymentId)
    if (!donation) return
    await this.donationRepository.updateStatus(donation.id, 'completed')
  }

  async markDonationFailed(stripePaymentId: string): Promise<void> {
    const donation = await this.donationRepository.findByStripePaymentId(stripePaymentId)
    if (!donation) return
    await this.donationRepository.updateStatus(donation.id, 'failed')
  }
}

export const createDonationService = (context: ServiceContext) =>
  new DonationService(new DonationRepository(db), context)
