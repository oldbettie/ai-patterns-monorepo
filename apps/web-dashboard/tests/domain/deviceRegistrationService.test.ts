// @feature:device-registration @domain:devices @backend
// @summary: Tests for DeviceRegistrationService with mock repositories

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeviceRegistrationService } from '@/lib/services/deviceRegistrationService.temp'
import type { DeviceRepository } from '@auto-paster/database/src/repositories/deviceRepository'
import type { Device } from '@auto-paster/database/src/types'

// Temporary interfaces until migrations are run
interface PendingDeviceRegistration {
  token: string
  userId: string
  deviceIdPrefix: string
  detectedDeviceId: string | null
  detectedName: string | null
  detectedPlatform: string | null
  userApproved: boolean
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

interface PendingDeviceRegistrationRepository {
  createPendingRegistration: (data: any) => Promise<PendingDeviceRegistration>
  getPendingRegistration: (token: string) => Promise<PendingDeviceRegistration | null>
  getPendingRegistrationByUserAndPrefix: (userId: string, deviceIdPrefix: string) => Promise<PendingDeviceRegistration | null>
  updateDetectedDeviceInfo: (token: string, deviceId: string, name: string, platform: string) => Promise<PendingDeviceRegistration | null>
  approveRegistration: (token: string) => Promise<PendingDeviceRegistration | null>
  deletePendingRegistration: (token: string) => Promise<boolean>
  getUserPendingRegistrations: (userId: string) => Promise<PendingDeviceRegistration[]>
  cleanupExpiredRegistrations: () => Promise<number>
}

// Mock repositories
const createMockPendingRegistrationRepository = (): jest.Mocked<PendingDeviceRegistrationRepository> => ({
  createPendingRegistration: vi.fn(),
  getPendingRegistration: vi.fn(),
  getPendingRegistrationByUserAndPrefix: vi.fn(),
  updateDetectedDeviceInfo: vi.fn(),
  approveRegistration: vi.fn(),
  deletePendingRegistration: vi.fn(),
  getUserPendingRegistrations: vi.fn(),
  cleanupExpiredRegistrations: vi.fn(),
})

const createMockDeviceRepository = (): jest.Mocked<DeviceRepository> => ({
  upsertDevice: vi.fn(),
  getDeviceByDeviceId: vi.fn(),
  getUserDevices: vi.fn(),
  isUserDevice: vi.fn(),
  verifyDevice: vi.fn(),
  generateApiKey: vi.fn(),
  updateDeviceName: vi.fn(),
  deactivateDevice: vi.fn(),
  toggleReceiveUpdates: vi.fn(),
  generateVerificationToken: vi.fn(),
  getDevicesForUpdates: vi.fn(),
  deleteDevice: vi.fn(),
  updateDeviceLastSeen: vi.fn(),
})

describe('DeviceRegistrationService', () => {
  let service: DeviceRegistrationService
  let mockPendingRepo: jest.Mocked<PendingDeviceRegistrationRepository>
  let mockDeviceRepo: jest.Mocked<DeviceRepository>

  beforeEach(() => {
    mockPendingRepo = createMockPendingRegistrationRepository()
    mockDeviceRepo = createMockDeviceRepository()
    service = new DeviceRegistrationService(mockPendingRepo, mockDeviceRepo)
  })

  describe('createPendingRegistration', () => {
    it('should create a pending registration with proper expiration', async () => {
      const input = {
        token: 'dev_linux-be_1754803752',
        userId: 'user123',
        deviceIdPrefix: 'linux-be'
      }

      const mockRegistration: PendingDeviceRegistration = {
        token: input.token,
        userId: input.userId,
        deviceIdPrefix: input.deviceIdPrefix,
        detectedDeviceId: null,
        detectedName: null,
        detectedPlatform: null,
        userApproved: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPendingRepo.createPendingRegistration.mockResolvedValue(mockRegistration)

      const result = await service.createPendingRegistration(input)

      expect(result).toEqual(mockRegistration)
      expect(mockPendingRepo.createPendingRegistration).toHaveBeenCalledWith({
        token: input.token,
        userId: input.userId,
        deviceIdPrefix: input.deviceIdPrefix,
        userApproved: false,
        expiresAt: expect.any(Date),
      })
    })
  })

  describe('processDeviceRegistration', () => {
    it('should successfully process new device registration', async () => {
      const input = {
        token: 'dev_linux-be_1754803752',
        deviceId: 'linux-bettie-1754802938-b299f18e15e044b0',
        name: 'bettie',
        platform: 'linux' as const
      }

      const mockPendingRegistration: PendingDeviceRegistration = {
        token: input.token,
        userId: 'user123',
        deviceIdPrefix: 'linux-be',
        detectedDeviceId: null,
        detectedName: null,
        detectedPlatform: null,
        userApproved: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockDevice: Device = {
        id: 'device123',
        userId: 'user123',
        deviceId: input.deviceId,
        name: input.name,
        platform: input.platform,
        ipAddress: null,
        userAgent: null,
        apiKey: null,
        verified: true,
        receiveUpdates: true,
        lastSeenAt: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const apiKey = 'api_key_12345'

      // Setup mocks
      mockPendingRepo.getPendingRegistration.mockResolvedValueOnce(mockPendingRegistration)
      mockPendingRepo.updateDetectedDeviceInfo.mockResolvedValue({
        ...mockPendingRegistration,
        detectedDeviceId: input.deviceId,
        detectedName: input.name,
        detectedPlatform: input.platform
      })
      mockPendingRepo.getPendingRegistration.mockResolvedValueOnce({
        ...mockPendingRegistration,
        detectedDeviceId: input.deviceId,
        detectedName: input.name,
        detectedPlatform: input.platform
      })
      mockDeviceRepo.getDeviceByDeviceId.mockResolvedValue(null)
      mockDeviceRepo.upsertDevice.mockResolvedValue(mockDevice)
      mockDeviceRepo.generateApiKey.mockResolvedValue(apiKey)
      mockPendingRepo.deletePendingRegistration.mockResolvedValue(true)

      const result = await service.processDeviceRegistration(input)

      expect(result).toEqual({
        apiKey,
        deviceId: input.deviceId,
        device: mockDevice
      })

      expect(mockPendingRepo.getPendingRegistration).toHaveBeenCalledWith(input.token)
      expect(mockPendingRepo.updateDetectedDeviceInfo).toHaveBeenCalledWith(
        input.token,
        input.deviceId,
        input.name,
        input.platform
      )
      expect(mockDeviceRepo.upsertDevice).toHaveBeenCalledWith({
        deviceId: input.deviceId,
        name: input.name,
        platform: input.platform,
        userId: 'user123',
        verified: true
      })
      expect(mockDeviceRepo.generateApiKey).toHaveBeenCalledWith(input.deviceId)
      expect(mockPendingRepo.deletePendingRegistration).toHaveBeenCalledWith(input.token)
    })

    it('should handle existing device registration', async () => {
      const input = {
        token: 'dev_linux-be_1754803752',
        deviceId: 'linux-bettie-1754802938-b299f18e15e044b0',
        name: 'bettie',
        platform: 'linux' as const
      }

      const mockPendingRegistration: PendingDeviceRegistration = {
        token: input.token,
        userId: 'user123',
        deviceIdPrefix: 'linux-be',
        detectedDeviceId: input.deviceId,
        detectedName: input.name,
        detectedPlatform: input.platform,
        userApproved: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockExistingDevice: Device = {
        id: 'device123',
        userId: 'user123',
        deviceId: input.deviceId,
        name: input.name,
        platform: input.platform,
        ipAddress: null,
        userAgent: null,
        apiKey: 'existing_api_key',
        verified: true,
        receiveUpdates: true,
        lastSeenAt: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const newApiKey = 'new_api_key_12345'

      mockPendingRepo.getPendingRegistration.mockResolvedValue(mockPendingRegistration)
      mockDeviceRepo.getDeviceByDeviceId.mockResolvedValue(mockExistingDevice)
      mockDeviceRepo.isUserDevice.mockResolvedValue(true)
      mockDeviceRepo.generateApiKey.mockResolvedValue(newApiKey)
      mockPendingRepo.deletePendingRegistration.mockResolvedValue(true)

      const result = await service.processDeviceRegistration(input)

      expect(result).toEqual({
        apiKey: newApiKey,
        deviceId: input.deviceId,
        device: mockExistingDevice
      })

      expect(mockDeviceRepo.isUserDevice).toHaveBeenCalledWith('user123', input.deviceId)
      expect(mockDeviceRepo.upsertDevice).not.toHaveBeenCalled()
    })

    it('should throw error for invalid token', async () => {
      const input = {
        token: 'invalid_token',
        deviceId: 'linux-bettie-1754802938-b299f18e15e044b0',
        name: 'bettie',
        platform: 'linux' as const
      }

      mockPendingRepo.getPendingRegistration.mockResolvedValue(null)

      await expect(service.processDeviceRegistration(input)).rejects.toThrow(
        'Invalid or expired registration token'
      )
    })

    it('should throw error for device belonging to another user', async () => {
      const input = {
        token: 'dev_linux-be_1754803752',
        deviceId: 'linux-bettie-1754802938-b299f18e15e044b0',
        name: 'bettie',
        platform: 'linux' as const
      }

      const mockPendingRegistration: PendingDeviceRegistration = {
        token: input.token,
        userId: 'user123',
        deviceIdPrefix: 'linux-be',
        detectedDeviceId: input.deviceId,
        detectedName: input.name,
        detectedPlatform: input.platform,
        userApproved: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockExistingDevice: Device = {
        id: 'device123',
        userId: 'other_user',
        deviceId: input.deviceId,
        name: input.name,
        platform: input.platform,
        ipAddress: null,
        userAgent: null,
        apiKey: null,
        verified: true,
        receiveUpdates: true,
        lastSeenAt: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPendingRepo.getPendingRegistration.mockResolvedValue(mockPendingRegistration)
      mockDeviceRepo.getDeviceByDeviceId.mockResolvedValue(mockExistingDevice)
      mockDeviceRepo.isUserDevice.mockResolvedValue(false)

      await expect(service.processDeviceRegistration(input)).rejects.toThrow(
        'Device belongs to another user'
      )
    })

    it('should throw error for device ID mismatch', async () => {
      const input = {
        token: 'dev_linux-be_1754803752',
        deviceId: 'windows-pc-1754802938-b299f18e15e044b0', // Wrong platform
        name: 'pc',
        platform: 'windows' as const
      }

      const mockPendingRegistration: PendingDeviceRegistration = {
        token: input.token,
        userId: 'user123',
        deviceIdPrefix: 'linux-be', // Expects linux prefix
        detectedDeviceId: null,
        detectedName: null,
        detectedPlatform: null,
        userApproved: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPendingRepo.getPendingRegistration.mockResolvedValue(mockPendingRegistration)
      mockPendingRepo.updateDetectedDeviceInfo.mockResolvedValue(mockPendingRegistration)
      mockPendingRepo.getPendingRegistration.mockResolvedValue(mockPendingRegistration)

      await expect(service.processDeviceRegistration(input)).rejects.toThrow(
        'Device platform does not match registration token'
      )
    })
  })

  describe('findMatchingDevice', () => {
    it('should find device matching token prefix', async () => {
      const token = 'dev_linux-be_1754803752'
      
      const mockPendingRegistration: PendingDeviceRegistration = {
        token,
        userId: 'user123',
        deviceIdPrefix: 'linux-be',
        detectedDeviceId: null,
        detectedName: null,
        detectedPlatform: null,
        userApproved: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockDevices: Device[] = [
        {
          id: 'device1',
          userId: 'user123',
          deviceId: 'linux-bettie-1754802938-b299f18e15e044b0',
          name: 'bettie',
          platform: 'linux',
          ipAddress: null,
          userAgent: null,
          apiKey: null,
          verified: true,
          receiveUpdates: true,
          lastSeenAt: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockPendingRepo.getPendingRegistration.mockResolvedValue(mockPendingRegistration)
      mockDeviceRepo.getUserDevices.mockResolvedValue(mockDevices)

      const result = await service.findMatchingDevice(token)

      expect(result).toEqual(mockDevices[0])
      expect(mockDeviceRepo.getUserDevices).toHaveBeenCalledWith('user123')
    })

    it('should return null when no matching device found', async () => {
      const token = 'dev_linux-be_1754803752'
      
      const mockPendingRegistration: PendingDeviceRegistration = {
        token,
        userId: 'user123',
        deviceIdPrefix: 'linux-be',
        detectedDeviceId: null,
        detectedName: null,
        detectedPlatform: null,
        userApproved: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPendingRepo.getPendingRegistration.mockResolvedValue(mockPendingRegistration)
      mockDeviceRepo.getUserDevices.mockResolvedValue([])

      const result = await service.findMatchingDevice(token)

      expect(result).toBeNull()
    })
  })

  describe('parseRegistrationToken', () => {
    it('should parse valid registration token', () => {
      const token = 'dev_linux-be_1754803752'
      const result = service.parseRegistrationToken(token)

      expect(result).toEqual({
        deviceIdPrefix: 'linux-be',
        timestamp: 1754803752
      })
    })

    it('should return null for invalid token format', () => {
      const token = 'invalid_token_format'
      const result = service.parseRegistrationToken(token)

      expect(result).toBeNull()
    })

    it('should return null for token with non-dev prefix', () => {
      const token = 'prod_linux-be_1754803752'
      const result = service.parseRegistrationToken(token)

      expect(result).toBeNull()
    })
  })

  describe('parseDeviceId', () => {
    it('should parse valid device ID', () => {
      const deviceId = 'linux-bettie-1754802938-b299f18e15e044b0'
      const result = service.parseDeviceId(deviceId)

      expect(result).toEqual({
        platform: 'linux',
        hostname: 'bettie',
        timestamp: 1754802938
      })
    })

    it('should return null for invalid device ID format', () => {
      const deviceId = 'invalid-format'
      const result = service.parseDeviceId(deviceId)

      expect(result).toBeNull()
    })
  })

  describe('cleanupExpiredRegistrations', () => {
    it('should return count of cleaned up registrations', async () => {
      mockPendingRepo.cleanupExpiredRegistrations.mockResolvedValue(5)

      const result = await service.cleanupExpiredRegistrations()

      expect(result).toBe(5)
      expect(mockPendingRepo.cleanupExpiredRegistrations).toHaveBeenCalled()
    })
  })
})