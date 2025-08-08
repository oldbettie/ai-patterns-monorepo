// @feature:allow-list @domain:database @backend
// @summary: Repository implementation for allow list database operations

import 'server-only'
import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { familyAllowLists, presetAllowLists } from '../schemas'
import type { FamilyAllowList, NewFamilyAllowList, PresetAllowList } from '../types'
import type { IAllowListRepository } from './types'

export class AllowListRepository implements IAllowListRepository {
  constructor(private db: NodePgDatabase<any>) {}

  async getFamilyAllowList(familyId: string): Promise<FamilyAllowList | null> {
    const result = await this.db
      .select()
      .from(familyAllowLists)
      .where(eq(familyAllowLists.familyId, familyId))
      .limit(1)

    return result[0] || null
  }

  async createFamilyAllowList(data: NewFamilyAllowList): Promise<FamilyAllowList> {
    const result = await this.db
      .insert(familyAllowLists)
      .values({
        ...data,
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      })
      .returning()

    if (!result[0]) {
      throw new Error('Failed to create family allow list')
    }

    return result[0]
  }

  async updateFamilyAllowList(
    familyId: string, 
    data: Partial<FamilyAllowList>
  ): Promise<FamilyAllowList> {
    const result = await this.db
      .update(familyAllowLists)
      .set({
        ...data,
        updatedAt: new Date(),
        // Increment version when updating
        listVersion: data.listVersion ? data.listVersion + 1 : undefined,
      })
      .where(eq(familyAllowLists.familyId, familyId))
      .returning()

    if (!result[0]) {
      throw new Error(`Family allow list not found for familyId: ${familyId}`)
    }

    return result[0]
  }

  async deleteFamilyAllowList(familyId: string): Promise<void> {
    await this.db
      .delete(familyAllowLists)
      .where(eq(familyAllowLists.familyId, familyId))
  }

  async getPresetAllowLists(): Promise<PresetAllowList[]> {
    return await this.db
      .select()
      .from(presetAllowLists)
      .orderBy(presetAllowLists.createdAt)
  }

  async getPresetByMode(mode: string): Promise<PresetAllowList | null> {
    const result = await this.db
      .select()
      .from(presetAllowLists)
      .where(eq(presetAllowLists.modeName, mode))
      .limit(1)

    return result[0] || null
  }

  async getActivePresetAllowLists(): Promise<PresetAllowList[]> {
    return await this.db
      .select()
      .from(presetAllowLists)
      .where(eq(presetAllowLists.isActive, true))
      .orderBy(presetAllowLists.createdAt)
  }
}

export const createAllowListRepository = (db: NodePgDatabase<any>): IAllowListRepository => {
  return new AllowListRepository(db)
}