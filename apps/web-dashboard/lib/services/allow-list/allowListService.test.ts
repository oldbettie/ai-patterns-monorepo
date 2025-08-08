// @feature:allow-list @domain:allow-list @backend
// @summary: Comprehensive tests for AllowListService with mock repository

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AllowListService } from './allowListService'
import type { 
  IAllowListRepository,
  FamilyAllowList, 
  NewFamilyAllowList, 
  PresetAllowList 
} from '@proxy-fam/database/src/schemas'
import type { ServiceContext, PresetMode } from './types'

// Mock repository implementation
class MockAllowListRepository implements IAllowListRepository {
  private familyAllowLists: Map<string, FamilyAllowList> = new Map()
  private presetAllowLists: PresetAllowList[] = []

  // Mock functions for testing
  public mockGetFamilyAllowList = vi.fn()
  public mockCreateFamilyAllowList = vi.fn()
  public mockUpdateFamilyAllowList = vi.fn()
  public mockDeleteFamilyAllowList = vi.fn()
  public mockGetPresetAllowLists = vi.fn()
  public mockGetPresetByMode = vi.fn()
  public mockGetActivePresetAllowLists = vi.fn()

  async getFamilyAllowList(familyId: string): Promise<FamilyAllowList | null> {
    return this.mockGetFamilyAllowList(familyId)
  }

  async createFamilyAllowList(data: NewFamilyAllowList): Promise<FamilyAllowList> {
    return this.mockCreateFamilyAllowList(data)
  }

  async updateFamilyAllowList(familyId: string, data: Partial<FamilyAllowList>): Promise<FamilyAllowList> {
    return this.mockUpdateFamilyAllowList(familyId, data)
  }

  async deleteFamilyAllowList(familyId: string): Promise<void> {
    return this.mockDeleteFamilyAllowList(familyId)
  }

  async getPresetAllowLists(): Promise<PresetAllowList[]> {
    return this.mockGetPresetAllowLists()
  }

  async getPresetByMode(mode: string): Promise<PresetAllowList | null> {
    return this.mockGetPresetByMode(mode)
  }

  async getActivePresetAllowLists(): Promise<PresetAllowList[]> {
    return this.mockGetActivePresetAllowLists()
  }

  // Helper methods for test setup
  setMockFamilyAllowList(familyId: string, allowList: FamilyAllowList | null) {
    this.mockGetFamilyAllowList.mockResolvedValue(allowList)
  }

  setMockPresetByMode(mode: string, preset: PresetAllowList | null) {
    this.mockGetPresetByMode.mockResolvedValue(preset)
  }
}

describe('AllowListService', () => {
  const createTestService = () => {
    const repositories = {
      allowListRepo: new MockAllowListRepository(),
    }

    const context: ServiceContext = {
      userId: 'test-user-id',
      familyId: 'test-family-id',
    }

    const service = new AllowListService(repositories.allowListRepo, context)
    return { ...repositories, service, context }
  }

  const mockFamilyAllowList: FamilyAllowList = {
    id: 'test-id',
    familyId: 'test-family-id',
    userId: 'test-user-id',
    allowedApplications: JSON.stringify(['Steam', 'Discord']),
    presetMode: 'gaming-optimized',
    listVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockPresetAllowList: PresetAllowList = {
    id: 'preset-id',
    modeName: 'gaming-optimized',
    applications: JSON.stringify(['Steam', 'Discord', 'Epic Games']),
    description: 'Optimized for gaming performance',
    isActive: true,
    createdAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getFamilyAllowList', () => {
    it('should return existing family allow list', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)

      const result = await service.getFamilyAllowList()

      expect(result).toEqual(mockFamilyAllowList)
      expect(allowListRepo.mockGetFamilyAllowList).toHaveBeenCalledWith('test-family-id')
    })

    it('should create default allow list for new families', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', null)
      
      const createdAllowList = { ...mockFamilyAllowList, presetMode: 'custom', allowedApplications: JSON.stringify([]) }
      allowListRepo.mockCreateFamilyAllowList.mockResolvedValue(createdAllowList)

      const result = await service.getFamilyAllowList()

      expect(result).toEqual(createdAllowList)
      expect(allowListRepo.mockCreateFamilyAllowList).toHaveBeenCalledWith(
        expect.objectContaining({
          familyId: 'test-family-id',
          userId: 'test-user-id',
          allowedApplications: JSON.stringify([]),
          presetMode: 'custom',
          listVersion: 1,
          id: expect.any(String),
        })
      )
    })
  })

  describe('applyPresetMode', () => {
    it('should apply preset mode successfully', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)
      allowListRepo.setMockPresetByMode('gaming-optimized', mockPresetAllowList)
      
      const updatedAllowList = { ...mockFamilyAllowList, listVersion: 2 }
      allowListRepo.mockUpdateFamilyAllowList.mockResolvedValue(updatedAllowList)

      const result = await service.applyPresetMode('gaming-optimized')

      expect(result).toEqual(updatedAllowList)
      expect(allowListRepo.mockGetPresetByMode).toHaveBeenCalledWith('gaming-optimized')
      expect(allowListRepo.mockUpdateFamilyAllowList).toHaveBeenCalledWith('test-family-id', {
        allowedApplications: mockPresetAllowList.applications,
        presetMode: 'gaming-optimized',
        listVersion: 2,
      })
    })

    it('should throw error for non-existent preset', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockPresetByMode('invalid-mode', null)

      await expect(service.applyPresetMode('invalid-mode' as PresetMode)).rejects.toThrow(
        "Preset mode 'invalid-mode' not found"
      )
    })

    it('should throw error for inactive preset', async () => {
      const { service, allowListRepo } = createTestService()
      const inactivePreset = { ...mockPresetAllowList, isActive: false }
      allowListRepo.setMockPresetByMode('gaming-optimized', inactivePreset)

      await expect(service.applyPresetMode('gaming-optimized')).rejects.toThrow(
        "Preset mode 'gaming-optimized' is not active"
      )
    })
  })

  describe('addApplications', () => {
    it('should add new applications to existing list', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)
      
      const updatedAllowList = { 
        ...mockFamilyAllowList, 
        allowedApplications: JSON.stringify(['Steam', 'Discord', 'Spotify']),
        presetMode: 'custom',
        listVersion: 2
      }
      allowListRepo.mockUpdateFamilyAllowList.mockResolvedValue(updatedAllowList)

      const result = await service.addApplications(['Spotify'])

      expect(result).toEqual(updatedAllowList)
      expect(allowListRepo.mockUpdateFamilyAllowList).toHaveBeenCalledWith('test-family-id', {
        allowedApplications: JSON.stringify(['Steam', 'Discord', 'Spotify']),
        presetMode: 'custom',
        listVersion: 2,
      })
    })

    it('should not add duplicate applications', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)
      
      const updatedAllowList = { 
        ...mockFamilyAllowList, 
        presetMode: 'custom',
        listVersion: 2
      }
      allowListRepo.mockUpdateFamilyAllowList.mockResolvedValue(updatedAllowList)

      const result = await service.addApplications(['Steam', 'Discord']) // Already exists

      expect(result).toEqual(updatedAllowList)
      expect(allowListRepo.mockUpdateFamilyAllowList).toHaveBeenCalledWith('test-family-id', {
        allowedApplications: JSON.stringify(['Steam', 'Discord']), // No duplicates added
        presetMode: 'custom',
        listVersion: 2,
      })
    })

    it('should return current list when no applications provided', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)

      const result = await service.addApplications([])

      expect(result).toEqual(mockFamilyAllowList)
      expect(allowListRepo.mockUpdateFamilyAllowList).not.toHaveBeenCalled()
    })
  })

  describe('removeApplications', () => {
    it('should remove applications from existing list', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)
      
      const updatedAllowList = { 
        ...mockFamilyAllowList, 
        allowedApplications: JSON.stringify(['Discord']),
        presetMode: 'custom',
        listVersion: 2
      }
      allowListRepo.mockUpdateFamilyAllowList.mockResolvedValue(updatedAllowList)

      const result = await service.removeApplications(['Steam'])

      expect(result).toEqual(updatedAllowList)
      expect(allowListRepo.mockUpdateFamilyAllowList).toHaveBeenCalledWith('test-family-id', {
        allowedApplications: JSON.stringify(['Discord']),
        presetMode: 'custom',
        listVersion: 2,
      })
    })

    it('should return current list when no applications provided', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)

      const result = await service.removeApplications([])

      expect(result).toEqual(mockFamilyAllowList)
      expect(allowListRepo.mockUpdateFamilyAllowList).not.toHaveBeenCalled()
    })
  })

  describe('addSingleApplication', () => {
    it('should add single application', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)
      
      const updatedAllowList = { 
        ...mockFamilyAllowList, 
        allowedApplications: JSON.stringify(['Steam', 'Discord', 'Spotify']),
        presetMode: 'custom',
        listVersion: 2
      }
      allowListRepo.mockUpdateFamilyAllowList.mockResolvedValue(updatedAllowList)

      const result = await service.addSingleApplication('Spotify')

      expect(result).toEqual(updatedAllowList)
    })

    it('should throw error for empty application name', async () => {
      const { service } = createTestService()

      await expect(service.addSingleApplication('')).rejects.toThrow(
        'Application name cannot be empty'
      )
    })

    it('should throw error for application name exceeding 255 characters', async () => {
      const { service } = createTestService()
      const longName = 'a'.repeat(256)

      await expect(service.addSingleApplication(longName)).rejects.toThrow(
        'Application name cannot exceed 255 characters'
      )
    })
  })

  describe('performBulkOperation', () => {
    it('should perform bulk add operation', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)
      
      const updatedAllowList = { 
        ...mockFamilyAllowList, 
        allowedApplications: JSON.stringify(['Steam', 'Discord', 'Spotify', 'Teams']),
        presetMode: 'custom',
        listVersion: 2
      }
      allowListRepo.mockUpdateFamilyAllowList.mockResolvedValue(updatedAllowList)

      const result = await service.performBulkOperation({
        action: 'add',
        applications: ['Spotify', 'Teams']
      })

      expect(result).toEqual(updatedAllowList)
    })

    it('should perform bulk remove operation', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockFamilyAllowList('test-family-id', mockFamilyAllowList)
      
      const updatedAllowList = { 
        ...mockFamilyAllowList, 
        allowedApplications: JSON.stringify([]),
        presetMode: 'custom',
        listVersion: 2
      }
      allowListRepo.mockUpdateFamilyAllowList.mockResolvedValue(updatedAllowList)

      const result = await service.performBulkOperation({
        action: 'remove',
        applications: ['Steam', 'Discord']
      })

      expect(result).toEqual(updatedAllowList)
    })

    it('should throw error for invalid action', async () => {
      const { service } = createTestService()

      await expect(service.performBulkOperation({
        action: 'invalid' as 'add' | 'remove',
        applications: ['Steam']
      })).rejects.toThrow('Action must be either "add" or "remove"')
    })

    it('should throw error for empty applications array', async () => {
      const { service } = createTestService()

      await expect(service.performBulkOperation({
        action: 'add',
        applications: []
      })).rejects.toThrow('Applications array cannot be empty')
    })
  })

  describe('getAvailablePresetModes', () => {
    it('should return all active preset modes', async () => {
      const { service, allowListRepo } = createTestService()
      const presets = [mockPresetAllowList]
      allowListRepo.mockGetActivePresetAllowLists.mockResolvedValue(presets)

      const result = await service.getAvailablePresetModes()

      expect(result).toEqual(presets)
      expect(allowListRepo.mockGetActivePresetAllowLists).toHaveBeenCalled()
    })
  })

  describe('getPresetModeDetails', () => {
    it('should return preset mode details', async () => {
      const { service, allowListRepo } = createTestService()
      allowListRepo.setMockPresetByMode('gaming-optimized', mockPresetAllowList)

      const result = await service.getPresetModeDetails('gaming-optimized')

      expect(result).toEqual(mockPresetAllowList)
      expect(allowListRepo.mockGetPresetByMode).toHaveBeenCalledWith('gaming-optimized')
    })
  })
})