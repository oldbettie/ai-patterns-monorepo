// @feature:allow-list @domain:database @shared
// @summary: Repository interfaces for allow list data access

import type { FamilyAllowList, NewFamilyAllowList, PresetAllowList } from '../types'

export interface IAllowListRepository {
  /**
   * Get family allow list by family ID
   */
  getFamilyAllowList(familyId: string): Promise<FamilyAllowList | null>

  /**
   * Create new family allow list
   */
  createFamilyAllowList(data: NewFamilyAllowList): Promise<FamilyAllowList>

  /**
   * Update family allow list
   */
  updateFamilyAllowList(familyId: string, data: Partial<FamilyAllowList>): Promise<FamilyAllowList>

  /**
   * Delete family allow list
   */
  deleteFamilyAllowList(familyId: string): Promise<void>

  /**
   * Get all available preset allow lists
   */
  getPresetAllowLists(): Promise<PresetAllowList[]>

  /**
   * Get preset allow list by mode name
   */
  getPresetByMode(mode: string): Promise<PresetAllowList | null>

  /**
   * Get active preset allow lists only
   */
  getActivePresetAllowLists(): Promise<PresetAllowList[]>
}