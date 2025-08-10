import "server-only"
import { DeviceRepository } from "@auto-paster/database/src/repositories/deviceRepository"
import { db } from "@auto-paster/database/src/database"
import { ServiceContext } from "@/lib/types"

export interface RegisterDeviceInput {
  deviceId: string
  name: string
  platform: "linux" | "darwin" | "windows"
  ipAddress?: string | null
  userAgent?: string | null
}

export class DeviceService {
  private readonly deviceRepository: DeviceRepository
  private readonly context: ServiceContext

  constructor(
    deviceRepository: DeviceRepository,
    context: ServiceContext
  ) {
    this.deviceRepository = deviceRepository
    this.context = context
  }

  async registerOrUpdateDevice(input: RegisterDeviceInput) {
    return this.deviceRepository.upsertDevice({
      userId: this.context.user.id,
      deviceId: input.deviceId,
      name: input.name,
      platform: input.platform,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    })
  }

  async listUserDevices() {
    return this.deviceRepository.getUserDevices(this.context.user.id)
  }

  async renameDevice(deviceId: string, name: string) {
    const isOwned = await this.deviceRepository.isUserDevice(this.context.user.id, deviceId)
    if (!isOwned) {
      throw new Error("Forbidden: device does not belong to user")
    }
    return this.deviceRepository.updateDeviceName(deviceId, name)
  }

  async deactivateDevice(deviceId: string) {
    const isOwned = await this.deviceRepository.isUserDevice(this.context.user.id, deviceId)
    if (!isOwned) {
      throw new Error("Forbidden: device does not belong to user")
    }
    await this.deviceRepository.deactivateDevice(deviceId)
  }

  async getInternalDeviceIdByAgentId(agentDeviceId: string) {
    const device = await this.deviceRepository.getDeviceByDeviceId(agentDeviceId)
    return device?.id ?? null
  }

  async verifyDevice(deviceId: string) {
    const isOwned = await this.deviceRepository.isUserDevice(this.context.user.id, deviceId)
    if (!isOwned) {
      throw new Error("Forbidden: device does not belong to user")
    }
    return this.deviceRepository.verifyDevice(deviceId)
  }

  async toggleDeviceUpdates(deviceId: string, receiveUpdates: boolean) {
    const isOwned = await this.deviceRepository.isUserDevice(this.context.user.id, deviceId)
    if (!isOwned) {
      throw new Error("Forbidden: device does not belong to user")
    }
    return this.deviceRepository.toggleReceiveUpdates(deviceId, receiveUpdates)
  }

  async generateVerificationToken(deviceId: string) {
    const isOwned = await this.deviceRepository.isUserDevice(this.context.user.id, deviceId)
    if (!isOwned) {
      throw new Error("Forbidden: device does not belong to user")
    }
    return this.deviceRepository.generateVerificationToken(deviceId)
  }

  async getDevicesForUpdates(excludeDeviceId?: string) {
    return this.deviceRepository.getDevicesForUpdates(this.context.user.id, excludeDeviceId)
  }

  async deleteDevice(deviceId: string) {
    const isOwned = await this.deviceRepository.isUserDevice(this.context.user.id, deviceId)
    if (!isOwned) {
      throw new Error("Forbidden: device does not belong to user")
    }
    await this.deviceRepository.deleteDevice(deviceId)
  }

  async deleteAllUserDevices() {
    return this.deviceRepository.deleteAllUserDevices(this.context.user.id)
  }

  // Helper method to get the user's current device IP (would be called from client)
  async getCurrentDeviceInfo(): Promise<{ ip: string | null, userAgent: string | null }> {
    // In a real implementation, this might detect the current IP address
    // For now, return null and let the client handle it
    return {
      ip: null,
      userAgent: null
    }
  }
}

export const createDeviceService = (req: ServiceContext) => {
  const deviceRepository = new DeviceRepository(db)

  return new DeviceService(deviceRepository, req)
}

