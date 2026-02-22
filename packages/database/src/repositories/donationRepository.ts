// @feature:donation-repository @domain:donations @backend
// @summary: Donation repository for managing donation records in the database

import 'server-only'

import { db, type DB } from '../database'
import { donations } from '../schemas'
import type { Donation, NewDonation, DonationStatus } from '../types'
import { eq } from 'drizzle-orm'

export class DonationRepository {
  constructor(private readonly db: DB) {}

  async create(data: NewDonation): Promise<Donation> {
    const result = await this.db.insert(donations).values(data).returning()
    return result[0]
  }

  async findByUserId(userId: string): Promise<Donation[]> {
    return this.db.select().from(donations).where(eq(donations.userId, userId))
  }

  async findByPolarOrderId(polarOrderId: string): Promise<Donation | undefined> {
    const result = await this.db
      .select()
      .from(donations)
      .where(eq(donations.polarOrderId, polarOrderId))
      .limit(1)
    return result[0]
  }

  async updateStatus(id: string, status: DonationStatus): Promise<void> {
    await this.db
      .update(donations)
      .set({ status, updatedAt: new Date() })
      .where(eq(donations.id, id))
  }
}

export function createDonationRepository(database: DB = db): DonationRepository {
  return new DonationRepository(database)
}
