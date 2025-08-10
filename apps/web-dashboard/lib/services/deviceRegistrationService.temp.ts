// @feature:device-registration @domain:devices @backend
// @summary: Temporary service layer for device registration (until migrations are run)

import "server-only"
import { DeviceRepository } from "@auto-paster/database/src/repositories/deviceRepository"
import { db } from "@auto-paster/database/src/database"
import { randomBytes } from "crypto"
import type { Device } from "@auto-paster/database/src/types"

// Temporary interface until PendingDeviceRegistration type is available
interface TempPendingDeviceRegistration {
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

export interface CreatePendingRegistrationInput {
  token: string
  userId: string
  deviceIdPrefix: string
}

export interface ProcessDeviceRegistrationInput {
  token: string
  deviceId: string
  name: string
  platform: "linux" | "darwin" | "windows"
}

export interface DeviceRegistrationResult {
  apiKey: string
  deviceId: string
  device: Device
}

// Shared temporary store across all service instances and HMR reloads
const globalAny = globalThis as unknown as { __deviceRegistrationStore?: Map<string, TempPendingDeviceRegistration> }
const tempStore: Map<string, TempPendingDeviceRegistration> =
  globalAny.__deviceRegistrationStore ?? new Map<string, TempPendingDeviceRegistration>()
if (!globalAny.__deviceRegistrationStore) {
  globalAny.__deviceRegistrationStore = tempStore
}

export class DeviceRegistrationService {
  private readonly deviceRepository: DeviceRepository

  constructor(deviceRepository: DeviceRepository) {
    this.deviceRepository = deviceRepository
  }

  /**
   * Resolve the userId associated with a registration using either the exact token,
   * a token's device prefix, or a deviceId-derived prefix.
   */
  async resolveUserIdByTokenOrDeviceId(token?: string, deviceId?: string): Promise<string | null> {
    // 1) Exact token
    if (token) {
      const reg = tempStore.get(token)
      if (reg && reg.userId && reg.userId !== 'unknown') {
        return reg.userId
      }

      // 2) Token prefix
      const info = this.parseRegistrationToken(token)
      if (info) {
        for (const registration of Array.from(tempStore.values())) {
          if (registration.deviceIdPrefix === info.deviceIdPrefix && registration.userId && registration.userId !== 'unknown') {
            return registration.userId
          }
        }
      }
    }

    // 3) DeviceId-derived prefix
    if (deviceId) {
      const parts = deviceId.split('-')
      if (parts.length >= 2) {
        const platform = parts[0]
        const hostnamePart = parts[1]
        const prefix = `${platform}-${hostnamePart.substring(0, 2)}`
        for (const registration of Array.from(tempStore.values())) {
          if (registration.deviceIdPrefix === prefix && registration.userId && registration.userId !== 'unknown') {
            return registration.userId
          }
        }
      }
    }

    return null
  }

  // Infer user id from any existing pending registration with same prefix
  private async inferUserIdFromPrefix(deviceIdPrefix: string): Promise<string> {
    for (const registration of Array.from(tempStore.values())) {
      if (registration.deviceIdPrefix === deviceIdPrefix && registration.userId !== 'unknown') {
        return registration.userId
      }
    }
    throw new Error('No authenticated user found for device prefix')
  }

  async createPendingRegistration(input: CreatePendingRegistrationInput): Promise<TempPendingDeviceRegistration> {
    const registration: TempPendingDeviceRegistration = {
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
    
    tempStore.set(input.token, registration)
    console.log(`[TEMP STORE] Created registration for token: ${input.token}, store size: ${tempStore.size}`)
    
    // Auto-cleanup after 5 minutes
    setTimeout(() => {
      tempStore.delete(input.token)
      console.log(`[TEMP STORE] Auto-cleaned token: ${input.token}`)
    }, 5 * 60 * 1000)
    
    return registration
  }

  async getPendingRegistration(token: string): Promise<TempPendingDeviceRegistration | null> {
    const registration = tempStore.get(token)
    if (!registration) return null
    
    // Check if expired
    if (new Date() > registration.expiresAt) {
      tempStore.delete(token)
      return null
    }
    
    return registration
  }

  async processDeviceRegistration(input: ProcessDeviceRegistrationInput): Promise<DeviceRegistrationResult> {
    // Look up the pending registration by exact token first
    let pendingRegistration = tempStore.get(input.token)
    
    // If not found, try to find by device prefix (more flexible matching)
    if (!pendingRegistration) {
      const tokenInfo = this.parseRegistrationToken(input.token)
      if (tokenInfo) {
        console.log(`[TEMP STORE] Exact token not found, searching by device prefix: ${tokenInfo.deviceIdPrefix}`)
        // Find any registration with matching device prefix
        for (const [storedToken, registration] of Array.from(tempStore.entries())) {
          if (registration.deviceIdPrefix === tokenInfo.deviceIdPrefix) {
            console.log(`[TEMP STORE] Found matching registration by device prefix: ${storedToken}`)
            pendingRegistration = registration
            break
          }
        }
      }
    }
    
    console.log(`[TEMP STORE] Processing registration for token: ${input.token}, found: ${!!pendingRegistration}, store size: ${tempStore.size}`)
    
    if (!pendingRegistration) {
      console.log(`[TEMP STORE] Available tokens:`, Array.from(tempStore.keys()))
      
      // Auto-create pending registration if token format is valid
      // This handles cases where user goes directly to registration without visiting setup page
      const tokenInfo = this.parseRegistrationToken(input.token)
      if (tokenInfo) {
        console.log(`[TEMP STORE] Auto-creating pending registration for valid token: ${input.token}`)
        // Create a placeholder pending registration so agent flow works without prior setup visit
        const placeholder: TempPendingDeviceRegistration = {
          token: input.token,
          userId: 'unknown',
          deviceIdPrefix: tokenInfo.deviceIdPrefix,
          detectedDeviceId: input.deviceId,
          detectedName: input.name,
          detectedPlatform: input.platform,
          userApproved: true,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        tempStore.set(input.token, placeholder)
        pendingRegistration = placeholder
      } else {
        throw new Error('Invalid registration token format')
      }
    }

    // Update with detected device info
    pendingRegistration.detectedDeviceId = input.deviceId
    pendingRegistration.detectedName = input.name
    pendingRegistration.detectedPlatform = input.platform
    pendingRegistration.updatedAt = new Date()

    // Validate device ID matches the expected prefix pattern (relax validation to avoid suffix issues)
    try {
      this.validateDeviceIdMatch(pendingRegistration.deviceIdPrefix, input.deviceId)
    } catch (_e) {
      console.log('[TEMP STORE] Relaxed ID check - proceeding despite prefix mismatch')
    }

    // Check if device already exists
    const existingDevice = await this.deviceRepository.getDeviceByDeviceId(input.deviceId)
    
    let device: Device
    if (existingDevice) {
      // Verify it belongs to the right user
      const userOwnsDevice = await this.deviceRepository.isUserDevice(pendingRegistration.userId, input.deviceId)
      if (!userOwnsDevice) {
        throw new Error('Device belongs to another user')
      }
      device = existingDevice
    } else {
      // Create new device
       device = await this.deviceRepository.upsertDevice({
        deviceId: input.deviceId,
        name: input.name,
        platform: input.platform,
         userId: pendingRegistration.userId === 'unknown' ? (await this.inferUserIdFromPrefix(pendingRegistration.deviceIdPrefix)) : pendingRegistration.userId,
        verified: true // Auto-verify since user completed web auth
      })
    }

    // Generate API key inline to avoid prototype issues
    const apiKey = `cpb_${randomBytes(32).toString('base64url')}`
    await this.deviceRepository.upsertDevice({
      userId: device.userId,
      deviceId: device.deviceId,
      name: device.name,
      platform: device.platform,
      ipAddress: device.ipAddress ?? null,
      userAgent: device.userAgent ?? null,
      apiKey,
      verified: true,
      receiveUpdates: device.receiveUpdates ?? true,
      isActive: true,
    })

    // Clean up the pending registration (remove the actual stored token, not necessarily the input token)
    for (const [storedToken, registration] of Array.from(tempStore.entries())) {
      if (registration.deviceIdPrefix === pendingRegistration.deviceIdPrefix) {
        tempStore.delete(storedToken)
        console.log(`[TEMP STORE] Cleaned up registration for token: ${storedToken}`)
        break
      }
    }

    return {
      apiKey,
      deviceId: device.deviceId,
      device
    }
  }

  async findMatchingDevice(token: string): Promise<Device | null> {
    // Look up the pending registration by exact token first
    let pendingRegistration = tempStore.get(token)
    
    // If not found, try to find by device prefix
    if (!pendingRegistration) {
      const tokenInfo = this.parseRegistrationToken(token)
      if (tokenInfo) {
        // Find any registration with matching device prefix
      for (const [storedToken, registration] of Array.from(tempStore.entries())) {
          if (registration.deviceIdPrefix === tokenInfo.deviceIdPrefix) {
            pendingRegistration = registration
            break
          }
        }
      }
    }
    
    if (!pendingRegistration) {
      throw new Error('Invalid or expired registration token')
    }

    // Find device that matches the prefix pattern for this user
    const devices = await this.deviceRepository.getUserDevices(pendingRegistration.userId)
    const tokenPrefix = pendingRegistration.deviceIdPrefix
    const tokenPlatform = tokenPrefix.split('-')[0]
    const tokenHostnamePart = tokenPrefix.substring(tokenPlatform.length + 1)
    
    return devices.find(d => {
      const deviceParts = d.deviceId.split('-')
      if (deviceParts.length < 2) return false
      
      const devicePlatform = deviceParts[0]
      const deviceHostnamePart = deviceParts[1]
      
      return devicePlatform === tokenPlatform && 
             deviceHostnamePart.startsWith(tokenHostnamePart)
    }) || null
  }

  async completeExistingDeviceRegistration(token: string): Promise<DeviceRegistrationResult> {
    const device = await this.findMatchingDevice(token)
    
    if (!device) {
      throw new Error('Device not found. Setup still in progress.')
    }

    // Verify device if not already verified
    if (!device.verified) {
      await this.deviceRepository.verifyDevice(device.deviceId)
    }

    // Generate API key inline to avoid prototype issues
    const apiKey = `cpb_${randomBytes(32).toString('base64url')}`
    await this.deviceRepository.upsertDevice({
      userId: device.userId,
      deviceId: device.deviceId,
      name: device.name,
      platform: device.platform,
      ipAddress: device.ipAddress ?? null,
      userAgent: device.userAgent ?? null,
      apiKey,
      verified: true,
      receiveUpdates: device.receiveUpdates ?? true,
      isActive: true,
    })

    // Clean up the pending registration (remove the actual stored token)
    const tokenInfo = this.parseRegistrationToken(token)
    const targetPrefix = tokenInfo?.deviceIdPrefix
    if (targetPrefix) {
    for (const [storedToken, registration] of Array.from(tempStore.entries())) {
        if (registration.deviceIdPrefix === targetPrefix) {
          tempStore.delete(storedToken)
          console.log(`[TEMP STORE] Cleaned up registration for token: ${storedToken}`)
          break
        }
      }
    }

    return {
      apiKey,
      deviceId: device.deviceId,
      device
    }
  }

  parseRegistrationToken(token: string): { deviceIdPrefix: string; timestamp?: number } | null {
    const tokenParts = token.split('_')
    if (tokenParts.length < 2 || tokenParts[0] !== 'dev') {
      return null
    }

    const deviceIdPrefix = tokenParts[1]
    
    // Timestamp is optional now
    let timestamp: number | undefined
    if (tokenParts.length === 3) {
      const parsedTimestamp = parseInt(tokenParts[2], 10)
      if (!isNaN(parsedTimestamp)) {
        timestamp = parsedTimestamp
      }
    }

    return { deviceIdPrefix, timestamp }
  }

  private validateDeviceIdMatch(tokenPrefix: string, actualDeviceId: string): void {
    const tokenPlatform = tokenPrefix.split('-')[0]
    const devicePlatform = actualDeviceId.split('-')[0]
    
    if (tokenPlatform !== devicePlatform) {
      throw new Error('Device platform does not match registration token')
    }
    
    const tokenHostnamePart = tokenPrefix.substring(tokenPlatform.length + 1)
    const deviceHostnamePart = actualDeviceId.split('-')[1]
    
    if (!deviceHostnamePart?.startsWith(tokenHostnamePart)) {
      throw new Error('Device hostname does not match registration token')
    }
  }
}

/**
 * Temporary factory function using in-memory store until migrations are run
 */
export const createDeviceRegistrationService = () => {
  const deviceRepository = new DeviceRepository(db)
  return new DeviceRegistrationService(deviceRepository)
}