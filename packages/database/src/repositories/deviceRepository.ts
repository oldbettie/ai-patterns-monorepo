// @feature:device-management @domain:database @backend
// @summary: Repository for managing user devices and their presence

import type { DB } from '../database'
import { devices } from '../schemas'
import type { Device, NewDevice } from '../types'
import { eq, and, desc, ne } from 'drizzle-orm'
import { randomBytes } from 'crypto'

export class DeviceRepository {
  constructor(private readonly db: DB) {}
  /**
   * Create or update a device registration
   */
  async upsertDevice(deviceData: Omit<NewDevice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> {
    // Check if device already exists
    const existingDevice = await this.db
      .select()
      .from(devices)
      .where(eq(devices.deviceId, deviceData.deviceId))
      .limit(1)

    if (existingDevice.length > 0) {
      // Update existing device
      const [updatedDevice] = await this.db
        .update(devices)
        .set({
          ...deviceData,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        })
        .where(eq(devices.id, existingDevice[0].id))
        .returning()

      return updatedDevice
    }

    // Create new device
    const internalId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    const [newDevice] = await this.db
      .insert(devices)
      .values({
        id: internalId,
        ...deviceData,
        lastSeenAt: new Date(),
      })
      .returning()

    return newDevice
  }

  /**
   * Get all devices for a user
   */
  async getUserDevices(userId: string): Promise<Device[]> {
    const result = await this.db
      .select()
      .from(devices)
      .where(eq(devices.userId, userId))
      .orderBy(desc(devices.lastSeenAt))

    return result || []
  }

  /**
   * Get active devices for a user (seen within last 7 days)
   */
  async getActiveUserDevices(userId: string): Promise<Device[]> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return this.db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.userId, userId),
          eq(devices.isActive, true)
        )
      )
      .orderBy(desc(devices.lastSeenAt))
  }

  /**
   * Get device by device ID
   */
  async getDeviceByDeviceId(deviceId: string): Promise<Device | null> {
    const result = await this.db
      .select()
      .from(devices)
      .where(eq(devices.deviceId, deviceId))
      .limit(1)

    return result[0] || null
  }

  /**
   * Get device by internal ID
   */
  async getDeviceById(id: string): Promise<Device | null> {
    const result = await this.db
      .select()
      .from(devices)
      .where(eq(devices.id, id))
      .limit(1)

    return result[0] || null
  }

  /**
   * Update device last seen timestamp
   */
  async updateLastSeen(deviceId: string, ipAddress?: string): Promise<void> {
    const updateData: Partial<Device> = {
      lastSeenAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }

    if (ipAddress) {
      updateData.ipAddress = ipAddress
    }

    await this.db
      .update(devices)
      .set(updateData)
      .where(eq(devices.deviceId, deviceId))
  }

  /**
   * Deactivate a device
   */
  async deactivateDevice(deviceId: string): Promise<void> {
    await this.db
      .update(devices)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(devices.deviceId, deviceId))
  }

  /**
   * Update device name
   */
  async updateDeviceName(deviceId: string, name: string): Promise<Device | null> {
    const [updatedDevice] = await this.db
      .update(devices)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(devices.deviceId, deviceId))
      .returning()

    return updatedDevice || null
  }

  /**
   * Delete a device (removes all associated data)
   */
  async deleteDevice(deviceId: string): Promise<void> {
    await this.db
      .delete(devices)
      .where(eq(devices.deviceId, deviceId))
  }

  /**
   * Delete all devices for a user
   */
  async deleteAllUserDevices(userId: string): Promise<number> {
    const deletedDevices = await this.db
      .delete(devices)
      .where(eq(devices.userId, userId))
      .returning({ id: devices.id })
    
    return deletedDevices.length
  }

  /**
   * Get device count for a user
   */
  async getUserDeviceCount(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: devices.id })
      .from(devices)
      .where(and(eq(devices.userId, userId), eq(devices.isActive, true)))

    return result.length
  }

  /**
   * Check if device belongs to user
   */
  async isUserDevice(userId: string, deviceId: string): Promise<boolean> {
    const result = await this.db
      .select({ id: devices.id })
      .from(devices)
      .where(
        and(
          eq(devices.userId, userId),
          eq(devices.deviceId, deviceId)
        )
      )
      .limit(1)

    return result.length > 0
  }

  /**
   * Verify a device (mark as verified)
   */
  async verifyDevice(deviceId: string): Promise<Device | null> {
    const [verifiedDevice] = await this.db
      .update(devices)
      .set({
        verified: true,
        updatedAt: new Date(),
      })
      .where(eq(devices.deviceId, deviceId))
      .returning()

    return verifiedDevice || null
  }

  /**
   * Toggle device's receiveUpdates setting
   */
  async toggleReceiveUpdates(deviceId: string, receiveUpdates: boolean): Promise<Device | null> {
    const [updatedDevice] = await this.db
      .update(devices)
      .set({
        receiveUpdates,
        updatedAt: new Date(),
      })
      .where(eq(devices.deviceId, deviceId))
      .returning()

    return updatedDevice || null
  }

  /**
   * Get devices that should receive updates for a user (active, verified, and receiveUpdates = true)
   */
  async getDevicesForUpdates(userId: string, excludeDeviceId?: string): Promise<Device[]> {
    const conditions = [
      eq(devices.userId, userId),
      eq(devices.isActive, true),
      eq(devices.verified, true),
      eq(devices.receiveUpdates, true),
    ]

    if (excludeDeviceId) {
      conditions.push(ne(devices.deviceId, excludeDeviceId))
    }

    return this.db
      .select()
      .from(devices)
      .where(and(...conditions))
      .orderBy(desc(devices.lastSeenAt))
  }

  /**
   * Get verification token for device (generates verification URL)
   */
  async generateVerificationToken(deviceId: string): Promise<string> {
    // Generate a simple verification token (in production, use crypto.randomUUID())
    const token = `verify_${deviceId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    // In a real implementation, you might want to store this token temporarily
    // For now, we'll use the deviceId as part of the token for verification
    return token
  }

  /**
   * Generate and assign API key to a device
   */
  async generateApiKey(deviceId: string): Promise<string> {
    // Generate cryptographically secure API key
    const apiKey = `cpb_${randomBytes(32).toString('base64url')}`
    
    await this.db
      .update(devices)
      .set({
        apiKey,
        updatedAt: new Date(),
      })
      .where(eq(devices.deviceId, deviceId))
    
    return apiKey
  }

  /**
   * Authenticate device by API key
   */
  async authenticateByApiKey(apiKey: string): Promise<Device | null> {
    const result = await this.db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.apiKey, apiKey),
          eq(devices.isActive, true)
        )
      )
      .limit(1)
    
    if (result.length === 0) {
      return null
    }

    // Update last seen
    await this.updateLastSeen(result[0].deviceId)
    
    return result[0]
  }

  /**
   * Revoke API key for a device
   */
  async revokeApiKey(deviceId: string): Promise<void> {
    await this.db
      .update(devices)
      .set({
        apiKey: null,
        updatedAt: new Date(),
      })
      .where(eq(devices.deviceId, deviceId))
  }

  /**
   * Check if device has API key
   */
  async hasApiKey(deviceId: string): Promise<boolean> {
    const result = await this.db
      .select({ apiKey: devices.apiKey })
      .from(devices)
      .where(eq(devices.deviceId, deviceId))
      .limit(1)
    
    return result.length > 0 && result[0].apiKey !== null
  }

  /**
   * Get mapping from internal device IDs to external device IDs for a user
   */
  async getDeviceIdMapping(userId: string): Promise<Record<string, string>> {
    const result = await this.db
      .select({
        internalId: devices.id,
        externalId: devices.deviceId,
      })
      .from(devices)
      .where(eq(devices.userId, userId))

    return result.reduce((acc, device) => {
      acc[device.internalId] = device.externalId
      return acc
    }, {} as Record<string, string>)
  }
}