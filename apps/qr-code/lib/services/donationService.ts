// @feature:donations @domain:donations @backend
// @summary: Donation service handling donor status

import 'server-only'

import { DonationRepository } from '@quick-pdfs/database/src/repositories/donationRepository'
import { db } from '@quick-pdfs/database/src/database'
import type { ServiceContext } from '@/lib/types'
import type { DonorStatus } from '@quick-pdfs/common'

export class DonationService {
  constructor(
    private readonly donationRepository: DonationRepository,
    private readonly context: ServiceContext
  ) {}

  async getDonorStatus(): Promise<DonorStatus> {
    const donations = await this.donationRepository.findByUserId(this.context.user.id)
    const completed = donations.filter(d => d.status === 'completed')
    const isDonor = completed.length > 0

    const latest = completed.sort((a, b) =>
      new Date(b.donatedAt).getTime() - new Date(a.donatedAt).getTime()
    )[0]

    return {
      isDonor,
      tier: latest?.tier ?? null,
      expiresAt: latest?.expiresAt ? new Date(latest.expiresAt).toISOString() : null,
    }
  }
}

export const createDonationService = (context: ServiceContext) =>
  new DonationService(new DonationRepository(db), context)
