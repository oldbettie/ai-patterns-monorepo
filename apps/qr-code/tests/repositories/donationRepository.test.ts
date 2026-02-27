// @feature:donations @domain:donations @backend
// @summary: Unit tests for DonationRepository

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DonationRepository } from '@quick-pdfs/database/src/repositories/donationRepository'
import type { Donation, NewDonation } from '@quick-pdfs/database/src/types'

const makeDonation = (overrides: Partial<Donation> = {}): Donation => ({
  id: 'donation-1',
  userId: 'user-1',
  amount: 1000,
  currency: 'usd',
  status: 'pending',
  polarOrderId: 'order_test',
  tier: 'supporter',
  donatedAt: new Date(),
  expiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const createMockDB = () => ({
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([makeDonation()]),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([makeDonation()]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
})

describe('DonationRepository', () => {
  let mockDB: ReturnType<typeof createMockDB>
  let repo: DonationRepository

  beforeEach(() => {
    mockDB = createMockDB()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    repo = new DonationRepository(mockDB as any)
  })

  describe('create', () => {
    it('inserts a new donation and returns it', async () => {
      const newDonation: NewDonation = {
        id: 'donation-1',
        userId: 'user-1',
        amount: 1000,
        currency: 'usd',
        status: 'pending',
        polarOrderId: 'order_test',
        donatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const result = await repo.create(newDonation)
      expect(result).toBeDefined()
      expect(result.id).toBe('donation-1')
    })
  })

  describe('findByUserId', () => {
    it('queries donations by userId', async () => {
      mockDB.where = vi.fn().mockResolvedValue([makeDonation()])
      const results = await repo.findByUserId('user-1')
      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('updateStatus', () => {
    it('updates donation status', async () => {
      mockDB.where = vi.fn().mockResolvedValue(undefined)
      await expect(repo.updateStatus('donation-1', 'completed')).resolves.toBeUndefined()
    })
  })
})
