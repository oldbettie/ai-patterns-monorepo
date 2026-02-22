// @feature:donations @domain:donations @backend
// @summary: Unit tests for DonationService

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DonationService } from '@/lib/services/donationService'
import type { Donation } from '@quick-pdfs/database/src/types'
import type { ServiceContext } from '@/lib/types'

const makeDonation = (overrides: Partial<Donation> = {}): Donation => ({
  id: 'donation-1',
  userId: 'user-1',
  amount: 1000,
  currency: 'usd',
  status: 'completed',
  polarOrderId: 'order_test',
  tier: 'supporter',
  donatedAt: new Date(),
  expiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const createMockRepository = () => ({
  create: vi.fn().mockResolvedValue(makeDonation()),
  findByUserId: vi.fn().mockResolvedValue([makeDonation()]),
  findByPolarOrderId: vi.fn().mockResolvedValue(makeDonation()),
  updateStatus: vi.fn().mockResolvedValue(undefined),
})

const createMockContext = (): ServiceContext => ({
  user: { id: 'user-1', email: 'test@test.com', name: 'Test User', emailVerified: true, createdAt: new Date(), updatedAt: new Date(), image: null },
  session: { id: 'session-1', token: 'token', userId: 'user-1', expiresAt: new Date(), createdAt: new Date(), updatedAt: new Date(), ipAddress: null, userAgent: null },
} as unknown as ServiceContext)

describe('DonationService', () => {
  let mockRepo: ReturnType<typeof createMockRepository>
  let service: DonationService
  let context: ServiceContext

  beforeEach(() => {
    mockRepo = createMockRepository()
    context = createMockContext()
    service = new DonationService(mockRepo as never, context)
  })

  describe('getDonorStatus', () => {
    it('returns isDonor: true when completed donations exist', async () => {
      const status = await service.getDonorStatus()
      expect(status.isDonor).toBe(true)
    })

    it('returns isDonor: false when no completed donations', async () => {
      mockRepo.findByUserId.mockResolvedValue([makeDonation({ status: 'pending' })])
      const status = await service.getDonorStatus()
      expect(status.isDonor).toBe(false)
    })

    it('returns isDonor: false when no donations exist', async () => {
      mockRepo.findByUserId.mockResolvedValue([])
      const status = await service.getDonorStatus()
      expect(status.isDonor).toBe(false)
      expect(status.expiresAt).toBeNull()
    })
  })
})
