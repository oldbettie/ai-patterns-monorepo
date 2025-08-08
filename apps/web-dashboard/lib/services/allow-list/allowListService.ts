// @feature:allow-list @domain:allow-list @backend @service
// @summary: Allow list service for managing VPN bypass applications

import 'server-only'
import { 
  type FamilyAllowList, 
  type NewFamilyAllowList, 
  type PresetAllowList
} from '@proxy-fam/database/src/schemas'
import { db } from '@proxy-fam/database/src/database'
import { createAllowListRepository } from '@proxy-fam/database/src/repositories/allowListRepository'
import type { IAllowListRepository } from '@proxy-fam/database/src/repositories/types'
import type { ServiceContext, PresetMode, BulkOperationRequest } from './types'

export class AllowListService {
  constructor(
    private allowListRepository: IAllowListRepository,
    private context: ServiceContext
  ) {}

  /**
   * Get family allow list, create default if not exists
   */
  async getFamilyAllowList(): Promise<FamilyAllowList> {
    const existing = await this.allowListRepository.getFamilyAllowList(this.context.familyId)
    
    if (existing) {
      return existing
    }

    // Create default allow list for new families
    const defaultData: NewFamilyAllowList = {
      id: crypto.randomUUID(),
      familyId: this.context.familyId,
      userId: this.context.userId,
      allowedApplications: JSON.stringify([]),
      presetMode: 'custom',
      listVersion: 1,
    }

    return await this.allowListRepository.createFamilyAllowList(defaultData)
  }

  /**
   * Apply preset mode - replaces applications with preset defaults
   */
  async applyPresetMode(mode: PresetMode): Promise<FamilyAllowList> {
    const preset = await this.allowListRepository.getPresetByMode(mode)
    
    if (!preset) {
      throw new Error(`Preset mode '${mode}' not found`)
    }

    if (!preset.isActive) {
      throw new Error(`Preset mode '${mode}' is not active`)
    }

    const currentList = await this.getFamilyAllowList()
    
    return await this.allowListRepository.updateFamilyAllowList(
      this.context.familyId,
      {
        allowedApplications: preset.applications,
        presetMode: mode,
        listVersion: currentList.listVersion + 1,
      }
    )
  }

  /**
   * Add multiple applications to allow list (bulk operation)
   */
  async addApplications(applications: string[]): Promise<FamilyAllowList> {
    if (applications.length === 0) {
      return await this.getFamilyAllowList()
    }

    const currentList = await this.getFamilyAllowList()
    const currentApps = JSON.parse(currentList.allowedApplications || '[]') as string[]
    
    // Add new applications, avoiding duplicates
    const uniqueNewApps = applications.filter(app => !currentApps.includes(app))
    const updatedApps = [...currentApps, ...uniqueNewApps]

    return await this.allowListRepository.updateFamilyAllowList(
      this.context.familyId,
      {
        allowedApplications: JSON.stringify(updatedApps),
        presetMode: 'custom', // Switch to custom when manually adding
        listVersion: currentList.listVersion + 1,
      }
    )
  }

  /**
   * Remove multiple applications from allow list (bulk operation)
   */
  async removeApplications(applications: string[]): Promise<FamilyAllowList> {
    if (applications.length === 0) {
      return await this.getFamilyAllowList()
    }

    const currentList = await this.getFamilyAllowList()
    const currentApps = JSON.parse(currentList.allowedApplications || '[]') as string[]
    
    // Remove specified applications
    const updatedApps = currentApps.filter(app => !applications.includes(app))

    return await this.allowListRepository.updateFamilyAllowList(
      this.context.familyId,
      {
        allowedApplications: JSON.stringify(updatedApps),
        presetMode: 'custom', // Switch to custom when manually removing
        listVersion: currentList.listVersion + 1,
      }
    )
  }

  /**
   * Add single application to allow list
   */
  async addSingleApplication(application: string): Promise<FamilyAllowList> {
    this.validateApplicationName(application)
    return await this.addApplications([application])
  }

  /**
   * Remove single application from allow list
   */
  async removeSingleApplication(application: string): Promise<FamilyAllowList> {
    this.validateApplicationName(application)
    return await this.removeApplications([application])
  }

  /**
   * Perform bulk operation (add or remove multiple applications)
   */
  async performBulkOperation(request: BulkOperationRequest): Promise<FamilyAllowList> {
    this.validateBulkRequest(request)

    if (request.action === 'add') {
      return await this.addApplications(request.applications)
    } else {
      return await this.removeApplications(request.applications)
    }
  }

  /**
   * Get all available preset modes
   */
  async getAvailablePresetModes(): Promise<PresetAllowList[]> {
    return await this.allowListRepository.getActivePresetAllowLists()
  }

  /**
   * Get preset mode details by name
   */
  async getPresetModeDetails(mode: PresetMode): Promise<PresetAllowList | null> {
    return await this.allowListRepository.getPresetByMode(mode)
  }

  /**
   * Validate application name
   */
  private validateApplicationName(application: string): void {
    if (!application || application.trim().length === 0) {
      throw new Error('Application name cannot be empty')
    }

    if (application.length > 255) {
      throw new Error('Application name cannot exceed 255 characters')
    }
  }

  /**
   * Validate bulk operation request
   */
  private validateBulkRequest(request: BulkOperationRequest): void {
    if (!request.applications || request.applications.length === 0) {
      throw new Error('Applications array cannot be empty')
    }

    if (!['add', 'remove'].includes(request.action)) {
      throw new Error('Action must be either "add" or "remove"')
    }

    // Validate each application name
    request.applications.forEach(app => {
      this.validateApplicationName(app)
    })
  }
}

export const createAllowListDependencies = (
  req: { user: { id: string } }
): AllowListService => {
  const allowListRepository = createAllowListRepository(db)
  
  return new AllowListService(allowListRepository, {
    userId: req.user.id,
    familyId: req.user.id, // Use user ID as family ID for MVP
  })
}
