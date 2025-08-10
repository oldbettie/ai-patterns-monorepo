// @feature:device-api-auth @domain:database @backend
// @summary: Repository for authenticating desktop apps by API key

import type { DB } from '../database'
import { devices } from '../schemas'
import type { Device } from '../types'
import { and, eq } from 'drizzle-orm'

export class DesktopAuthRepository {
  constructor(private readonly db: DB) {}

  async getActiveDeviceByApiKey(apiKey: string): Promise<Device | null> {
    const result = await this.db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.apiKey, apiKey),
          eq(devices.isActive, true),
        )
      )
      .limit(1)

    return result[0] ?? null
  }

  async updateLastSeen(deviceId: string): Promise<void> {
    await this.db
      .update(devices)
      .set({ lastSeenAt: new Date(), updatedAt: new Date(), isActive: true })
      .where(eq(devices.deviceId, deviceId))
  }
}

