// @feature:clipboard-sync @domain:database @backend
// @summary: Repository for clipboard items and synchronization operations

import type { DB } from '../database'
import { clipboardItems, clipboardFiles, devices } from '../schemas'
import type { ClipboardItem, NewClipboardItem, ClipboardFile, NewClipboardFile } from '../types'
import { eq, and, gt, desc, sql } from 'drizzle-orm'

// Constants for content handling
const MAX_INLINE_CONTENT_SIZE = 1024 * 1024 // 1MB - store larger content in separate table

export interface ClipboardItemWithContent {
  item: ClipboardItem
  file?: ClipboardFile
}

export interface CreateClipboardItemParams {
  userId: string
  deviceId: string
  type: string
  mime?: string
  content: string
  contentHash: string
  sizeBytes: number
  isEncrypted?: boolean
  encryptionAlgorithm?: string
  metadata?: Record<string, any>
}

export class ClipboardRepository {
  constructor(private readonly db: DB) {}
  /**
   * Create a new clipboard item with automatic content handling
   */
  async createItem(params: CreateClipboardItemParams): Promise<ClipboardItemWithContent> {
    const { userId, deviceId, type, mime, content, contentHash, sizeBytes, isEncrypted = true, encryptionAlgorithm = 'AES-256-GCM', metadata } = params

    // Generate item ID
    const itemId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    // Determine if content should be stored inline or in separate table
    const shouldStoreInline = sizeBytes <= MAX_INLINE_CONTENT_SIZE

    // Create the main clipboard item
    const clipboardItemData: NewClipboardItem = {
      id: itemId,
      userId,
      deviceId,
      type,
      mime,
      contentHash,
      sizeBytes,
      content: shouldStoreInline ? content : null,
      isEncrypted,
      encryptionAlgorithm: isEncrypted ? encryptionAlgorithm : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }

    const [newItem] = await this.db
      .insert(clipboardItems)
      .values(clipboardItemData)
      .returning()

    let file: ClipboardFile | undefined

    // If content is too large, store in separate table
    if (!shouldStoreInline) {
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      const fileData: NewClipboardFile = {
        id: fileId,
        clipboardItemId: itemId,
        content,
      }

      const [newFile] = await this.db
        .insert(clipboardFiles)
        .values(fileData)
        .returning()

      file = newFile
    }

    return {
      item: newItem,
      file,
    }
  }

  /**
   * Get clipboard items since a specific sequence number for synchronization
   */
  async getItemsSince(userId: string, sinceSeq: number, limit: number = 50): Promise<ClipboardItemWithContent[]> {
    const items = await this.db
      .select()
      .from(clipboardItems)
      .where(
        and(
          eq(clipboardItems.userId, userId),
          gt(clipboardItems.seq, sinceSeq)
        )
      )
      .orderBy(clipboardItems.seq)
      .limit(limit)

    return this.attachContentToItems(items)
  }

  /**
   * Get recent clipboard items for a user (for dashboard display)
   */
  async getRecentItems(userId: string, limit: number = 20): Promise<ClipboardItemWithContent[]> {
    const items = await this.db
      .select()
      .from(clipboardItems)
      .where(eq(clipboardItems.userId, userId))
      .orderBy(desc(clipboardItems.createdAt))
      .limit(limit)

    return this.attachContentToItems(items)
  }

  /**
   * Get latest sequence number for a user (for sync initialization)
   */
  async getLatestSeq(userId: string): Promise<number> {
    const result = await this.db
      .select({ maxSeq: sql<number>`MAX(${clipboardItems.seq})` })
      .from(clipboardItems)
      .where(eq(clipboardItems.userId, userId))

    return result[0]?.maxSeq || 0
  }

  /**
   * Get clipboard item by ID with content
   */
  async getItemById(itemId: string): Promise<ClipboardItemWithContent | null> {
    const item = await this.db
      .select()
      .from(clipboardItems)
      .where(eq(clipboardItems.id, itemId))
      .limit(1)

    if (item.length === 0) {
      return null
    }

    const itemsWithContent = await this.attachContentToItems(item)
    return itemsWithContent[0] || null
  }

  /**
   * Check if item exists with same content hash (for deduplication)
   */
  async findByContentHash(userId: string, contentHash: string): Promise<ClipboardItem | null> {
    const result = await this.db
      .select()
      .from(clipboardItems)
      .where(
        and(
          eq(clipboardItems.userId, userId),
          eq(clipboardItems.contentHash, contentHash)
        )
      )
      .orderBy(desc(clipboardItems.createdAt))
      .limit(1)

    return result[0] || null
  }

  /**
   * Delete clipboard item and associated content
   */
  async deleteItem(itemId: string): Promise<void> {
    // Delete associated file content first (cascade will handle this automatically)
    await this.db.delete(clipboardItems).where(eq(clipboardItems.id, itemId))
  }

  /**
   * Delete all clipboard items for a user
   */
  async deleteAllUserItems(userId: string): Promise<number> {
    const deletedItems = await this.db
      .delete(clipboardItems)
      .where(eq(clipboardItems.userId, userId))
      .returning({ id: clipboardItems.id })
    
    return deletedItems.length
  }

  /**
   * Delete all clipboard items for a device
   */
  async deleteAllDeviceItems(deviceId: string): Promise<number> {
    const deletedItems = await this.db
      .delete(clipboardItems)
      .where(eq(clipboardItems.deviceId, deviceId))
      .returning({ id: clipboardItems.id })
    
    return deletedItems.length
  }

  /**
   * Get item count for a user
   */
  async getUserItemCount(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clipboardItems)
      .where(eq(clipboardItems.userId, userId))

    return result[0]?.count || 0
  }

  /**
   * Clean up old clipboard items (older than specified days)
   */
  async cleanupOldItems(days: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const deletedItems = await this.db
      .delete(clipboardItems)
      .where(sql`${clipboardItems.createdAt} < ${cutoffDate}`)
      .returning({ id: clipboardItems.id })

    return deletedItems.length
  }

  /**
   * Get items by device (for device-specific filtering)
   */
  async getItemsByDevice(userId: string, deviceId: string, limit: number = 50): Promise<ClipboardItemWithContent[]> {
    const items = await this.db
      .select()
      .from(clipboardItems)
      .where(
        and(
          eq(clipboardItems.userId, userId),
          eq(clipboardItems.deviceId, deviceId)
        )
      )
      .orderBy(desc(clipboardItems.createdAt))
      .limit(limit)

    return this.attachContentToItems(items)
  }

  /**
   * Get storage usage for user (total bytes)
   */
  async getUserStorageUsage(userId: string): Promise<number> {
    const result = await this.db
      .select({ totalSize: sql<number>`SUM(${clipboardItems.sizeBytes})` })
      .from(clipboardItems)
      .where(eq(clipboardItems.userId, userId))

    return result[0]?.totalSize || 0
  }

  /**
   * Private method to attach content from clipboardFiles table to items
   */
  private async attachContentToItems(items: ClipboardItem[]): Promise<ClipboardItemWithContent[]> {
    if (items.length === 0) {
      return []
    }

    // Get items that need content from the files table (those without inline content)
    const itemsNeedingContent = items.filter(item => !item.content)
    const itemIds = itemsNeedingContent.map(item => item.id)

    let filesMap: Record<string, ClipboardFile> = {}

    if (itemIds.length > 0) {
      const files = await this.db
        .select()
        .from(clipboardFiles)
        .where(sql`${clipboardFiles.clipboardItemId} = ANY(${itemIds})`)

      filesMap = files.reduce((acc, file) => {
        acc[file.clipboardItemId] = file
        return acc
      }, {} as Record<string, ClipboardFile>)
    }

    // Combine items with their content
    return items.map(item => ({
      item,
      file: filesMap[item.id],
    }))
  }

  /**
   * Update object storage URL for large content
   */
  async updateObjectStorageUrl(itemId: string, objectStorageUrl: string): Promise<void> {
    await this.db
      .update(clipboardFiles)
      .set({ 
        objectStorageUrl,
        content: null, // Clear base64 content when using object storage
      })
      .where(eq(clipboardFiles.clipboardItemId, itemId))
  }

  /**
   * Get items that need object storage migration (large items still stored as base64)
   */
  async getItemsNeedingStorageMigration(limit: number = 100): Promise<ClipboardFile[]> {
    return this.db
      .select()
      .from(clipboardFiles)
      .where(
        and(
          sql`${clipboardFiles.content} IS NOT NULL`,
          sql`${clipboardFiles.objectStorageUrl} IS NULL`,
          sql`LENGTH(${clipboardFiles.content}) > 1024 * 1024` // > 1MB
        )
      )
      .limit(limit)
  }

  /**
   * Get clipboard items since a specific sequence number, excluding specific device
   */
  async getItemsSinceExcludingDevice(userId: string, sinceSeq: number, excludeDeviceId?: string, limit: number = 50): Promise<ClipboardItemWithContent[]> {
    const conditions = [
      eq(clipboardItems.userId, userId),
      gt(clipboardItems.seq, sinceSeq)
    ]

    if (excludeDeviceId) {
      conditions.push(sql`${clipboardItems.deviceId} != ${excludeDeviceId}`)
    }

    const items = await this.db
      .select()
      .from(clipboardItems)
      .where(and(...conditions))
      .orderBy(clipboardItems.seq)
      .limit(limit)

    return this.attachContentToItems(items)
  }
}