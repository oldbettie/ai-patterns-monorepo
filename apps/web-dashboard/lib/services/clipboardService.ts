import "server-only"

import { ClipboardRepository } from "@auto-paster/database/src/repositories/clipboardRepository"
import { db, type DB } from "@auto-paster/database/src/database"
import type { CreateClipboardItemParams } from "@auto-paster/database/src/repositories/clipboardRepository"
import { ServiceContext } from "@/lib/types"


export class ClipboardService {
  private readonly clipboardRepository: ClipboardRepository
  private readonly context: ServiceContext

  constructor(
    clipboardRepository: ClipboardRepository,
    context: ServiceContext
  ) {
    this.clipboardRepository = clipboardRepository
    this.context = context
  }

  async createClipboardItem(input: Omit<CreateClipboardItemParams, "userId">) {
    return this.clipboardRepository.createItem({ ...input, userId: this.context.user.id })
  }

  async getItemsSince(sinceSeq: number, limit?: number) {
    return this.clipboardRepository.getItemsSince(this.context.user.id, sinceSeq, limit)
  }

  async getRecentItems(limit?: number) {
    return this.clipboardRepository.getRecentItems(this.context.user.id, limit)
  }

  async getItemById(itemId: string) {
    return this.clipboardRepository.getItemById(itemId)
  }

  async getItemsByDevice(deviceId: string, limit?: number) {
    return this.clipboardRepository.getItemsByDevice(this.context.user.id, deviceId, limit)
  }

  async deleteItem(itemId: string) {
    // Optional: enforce ownership by fetching item first; repository does not check user
    const item = await this.clipboardRepository.getItemById(itemId)
    if (!item || item.item.userId !== this.context.user.id) {
      throw new Error("Not found")
    }
    await this.clipboardRepository.deleteItem(itemId)
  }

  async findByContentHash(contentHash: string) {
    const item = await this.clipboardRepository.findByContentHash(this.context.user.id, contentHash)
    if (!item) return null
    
    // Return in same format as other methods
    return { item, file: undefined }
  }

  async getItemsSinceExcludingDevice(sinceSeq: number, excludeDeviceId?: string, limit?: number) {
    return this.clipboardRepository.getItemsSinceExcludingDevice(
      this.context.user.id, 
      sinceSeq, 
      excludeDeviceId, 
      limit
    )
  }

  async getLatestSeq() {
    return this.clipboardRepository.getLatestSeq(this.context.user.id)
  }
}

export const createClipboardService = (context: { user: any; session?: any }) => {
  const clipboardRepository = new ClipboardRepository(db)
  return new ClipboardService(clipboardRepository, context as ServiceContext)
}
