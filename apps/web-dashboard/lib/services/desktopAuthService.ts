// @feature:device-api-auth @domain:auth @backend
// @summary: Service wrapper for desktop API key authentication

import 'server-only'
import { db } from '@auto-paster/database/src/database'
import type { Device } from '@auto-paster/database/src/types'
import { DesktopAuthRepository } from '@auto-paster/database/src/repositories/desktopAuthRepository'

export class DesktopAuthService {
  constructor(
    private readonly desktopRepo: DesktopAuthRepository,
  ) {}

  async authenticateByApiKey(apiKey: string): Promise<Device | null> {
    const device = await this.desktopRepo.getActiveDeviceByApiKey(apiKey)
    if (!device) return null

    await this.desktopRepo.updateLastSeen(device.deviceId)
    return device
  }
}

export function createDesktopAuthService() {
  return new DesktopAuthService(new DesktopAuthRepository(db))
}

