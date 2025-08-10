// @feature:device-registration @domain:devices @backend
// @summary: Repository for managing pending device registrations during setup flow

import { eq, and, lt } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { pendingDeviceRegistrations } from '../schemas'
import type { PendingDeviceRegistration, NewPendingDeviceRegistration } from '../types'

export class PendingDeviceRegistrationRepository {
  constructor(private db: PostgresJsDatabase<any>) {}

  /**
   * Create a new pending device registration
   */
  async createPendingRegistration(data: NewPendingDeviceRegistration): Promise<PendingDeviceRegistration> {
    const [registration] = await this.db
      .insert(pendingDeviceRegistrations)
      .values(data)
      .returning()
    return registration
  }

  /**
   * Get a pending registration by token
   */
  async getPendingRegistration(token: string): Promise<PendingDeviceRegistration | null> {
    const [registration] = await this.db
      .select()
      .from(pendingDeviceRegistrations)
      .where(
        and(
          eq(pendingDeviceRegistrations.token, token),
          // Only return non-expired tokens
          lt(new Date(), pendingDeviceRegistrations.expiresAt)
        )
      )
      .limit(1)
    
    return registration || null
  }

  /**
   * Get a pending registration by user and device prefix (for flexible token matching)
   */
  async getPendingRegistrationByUserAndPrefix(userId: string, deviceIdPrefix: string): Promise<PendingDeviceRegistration | null> {
    const [registration] = await this.db
      .select()
      .from(pendingDeviceRegistrations)
      .where(
        and(
          eq(pendingDeviceRegistrations.userId, userId),
          eq(pendingDeviceRegistrations.deviceIdPrefix, deviceIdPrefix),
          // Only return non-expired tokens
          lt(new Date(), pendingDeviceRegistrations.expiresAt)
        )
      )
      .orderBy(pendingDeviceRegistrations.createdAt) // Get the most recent one
      .limit(1)
    
    return registration || null
  }

  /**
   * Update a pending registration with detected device info
   */
  async updateDetectedDeviceInfo(
    token: string, 
    detectedDeviceId: string, 
    detectedName: string, 
    detectedPlatform: string
  ): Promise<PendingDeviceRegistration | null> {
    const [updated] = await this.db
      .update(pendingDeviceRegistrations)
      .set({
        detectedDeviceId,
        detectedName,
        detectedPlatform,
        updatedAt: new Date(),
      })
      .where(eq(pendingDeviceRegistrations.token, token))
      .returning()
    
    return updated || null
  }

  /**
   * Mark a registration as user approved
   */
  async approveRegistration(token: string): Promise<PendingDeviceRegistration | null> {
    const [updated] = await this.db
      .update(pendingDeviceRegistrations)
      .set({
        userApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(pendingDeviceRegistrations.token, token))
      .returning()
    
    return updated || null
  }

  /**
   * Delete a pending registration (cleanup after successful registration)
   */
  async deletePendingRegistration(token: string): Promise<boolean> {
    const result = await this.db
      .delete(pendingDeviceRegistrations)
      .where(eq(pendingDeviceRegistrations.token, token))
    
    return result.rowCount > 0
  }

  /**
   * Get all pending registrations for a user
   */
  async getUserPendingRegistrations(userId: string): Promise<PendingDeviceRegistration[]> {
    return await this.db
      .select()
      .from(pendingDeviceRegistrations)
      .where(
        and(
          eq(pendingDeviceRegistrations.userId, userId),
          // Only return non-expired tokens
          lt(new Date(), pendingDeviceRegistrations.expiresAt)
        )
      )
      .orderBy(pendingDeviceRegistrations.createdAt)
  }

  /**
   * Clean up expired registrations
   */
  async cleanupExpiredRegistrations(): Promise<number> {
    const result = await this.db
      .delete(pendingDeviceRegistrations)
      .where(lt(pendingDeviceRegistrations.expiresAt, new Date()))
    
    return result.rowCount
  }

  /**
   * Extract device info from a registration token
   * Token format: dev_{deviceIdPrefix}_{timestamp}
   */
  static parseRegistrationToken(token: string): { deviceIdPrefix: string; timestamp: number } | null {
    const tokenParts = token.split('_')
    if (tokenParts.length !== 3 || tokenParts[0] !== 'dev') {
      return null
    }

    const deviceIdPrefix = tokenParts[1]
    const timestamp = parseInt(tokenParts[2], 10)
    
    if (isNaN(timestamp)) {
      return null
    }

    return { deviceIdPrefix, timestamp }
  }

  /**
   * Extract device info from a full device ID
   * Device ID format: {platform}-{hostname}-{timestamp}-{randomHex}
   */
  static parseDeviceId(deviceId: string): { platform: string; hostname: string; timestamp: number } | null {
    const parts = deviceId.split('-')
    if (parts.length < 4) {
      return null
    }

    const platform = parts[0]
    const hostname = parts[1] 
    const timestamp = parseInt(parts[2], 10)
    
    if (isNaN(timestamp)) {
      return null
    }

    return { platform, hostname, timestamp }
  }
}