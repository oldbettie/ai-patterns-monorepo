// @feature:clipboard-sync @domain:clipboard @api
// @summary: Optimized clipboard sync API for desktop apps with encryption support

import { createDesktopRouteHandler } from "@/lib/auth/desktop-route-handler"
import { NextResponse } from "next/server"
import { createClipboardService } from "@/lib/services/clipboardService"
import { DeviceRepository } from "@auto-paster/database/src/repositories/deviceRepository"
import { db } from "@auto-paster/database/src/database"
import { z } from "zod"

// Validation schemas for encrypted clipboard sync
const syncClipboardItemSchema = z.object({
  type: z.enum(['text', 'image', 'file']),
  mime: z.string().optional(),
  content: z.string(), // Base64 encoded encrypted content
  contentHash: z.string(), // Hash of encrypted content for deduplication
  sizeBytes: z.number().int().positive(),
  isEncrypted: z.boolean().default(true),
  encryptionAlgorithm: z.string().default('AES-256-GCM'),
  metadata: z.record(z.string(), z.any()).optional(),
})

const pollClipboardSchema = z.object({
  since: z.string().optional().transform((val) => val ? parseInt(val, 10) : 0),
  limit: z.string().optional().transform((val) => val ? Math.min(parseInt(val, 10), 100) : 50),
  excludeDevice: z.boolean().optional().default(true), // Exclude sender device from results
})

/**
 * Upload encrypted clipboard item from desktop app
 * POST /api/core/v1/clipboard/sync
 * 
 * Headers: Authorization: Bearer <api_key>
 * Body: { type, content, contentHash, sizeBytes, isEncrypted, encryptionAlgorithm, metadata? }
 * Returns: { data: { id, seq, created }, error: null }
 */
export const POST = createDesktopRouteHandler({ requireApiKey: true }, async (req) => {
  try {
    const body = await req.json()
    const parsed = syncClipboardItemSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, mime, content, contentHash, sizeBytes, isEncrypted, encryptionAlgorithm, metadata } = parsed.data

    // Create clipboard service with device context
    const clipboardService = createClipboardService({
      user: req.user,
      session: null as any, // Desktop apps don't use web sessions
    })

    // Check for duplicate content hash (deduplication)
    const existingItem = await clipboardService.findByContentHash(contentHash)
    if (existingItem) {
      // Additional protection: check if the existing item was created very recently
      // to prevent rapid back-and-forth syncing between devices
      const recentThreshold = new Date(Date.now() - 30000) // 30 seconds
      if (existingItem.item.createdAt > recentThreshold) {
        return NextResponse.json({
          data: {
            id: existingItem.item.id,
            seq: existingItem.item.seq,
            created: false,
            message: 'Content recently synced - preventing rapid re-sync'
          },
          error: null
        })
      }
      
      return NextResponse.json({
        data: {
          id: existingItem.item.id,
          seq: existingItem.item.seq,
          created: false,
          message: 'Content already exists'
        },
        error: null
      })
    }

    // Create new clipboard item with device context
    const result = await clipboardService.createClipboardItem({
      deviceId: req.device.id, // Use internal device ID for foreign key constraint
      type,
      mime,
      content,
      contentHash,
      sizeBytes,
      isEncrypted,
      encryptionAlgorithm,
      metadata,
    })

    return NextResponse.json({
      data: {
        id: result.item.id,
        seq: result.item.seq,
        created: true,
        deviceId: req.device.deviceId
      },
      error: null
    })
  } catch (error) {
    console.error('Error syncing clipboard item:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to sync clipboard item' },
      { status: 500 }
    )
  }
})

/**
 * Poll for new encrypted clipboard items
 * GET /api/core/v1/clipboard/sync?since=<seq>&limit=<limit>&excludeDevice=true
 * 
 * Headers: Authorization: Bearer <api_key>
 * Returns: { data: { items: [...], lastSeq: number }, error: null }
 */
export const GET = createDesktopRouteHandler({ requireApiKey: true }, async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = pollClipboardSchema.safeParse({
      since: searchParams.get('since'),
      limit: searchParams.get('limit'),
      excludeDevice: searchParams.get('excludeDevice') === 'true',
    })

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { since, limit, excludeDevice } = parsed.data

    // Create clipboard service with device context
    const clipboardService = createClipboardService({
      user: req.user,
      session: null as any, // Desktop apps don't use web sessions
    })

    // Get items since sequence number, optionally excluding sender device
    const items = await clipboardService.getItemsSinceExcludingDevice(
      since,
      excludeDevice ? req.device.id : undefined, // Use internal device ID for filtering
      limit
    )

    // Get latest sequence number for client state tracking
    const latestSeq = items.length > 0 
      ? Math.max(...items.map(item => item.item.seq))
      : await clipboardService.getLatestSeq()

    // Get device ID mapping to convert internal IDs back to external IDs
    const deviceRepository = new DeviceRepository(db)
    const deviceIdMapping = await deviceRepository.getDeviceIdMapping(req.user.id)

    // Transform items for desktop client
    const transformedItems = items.map(item => ({
      id: item.item.id,
      seq: item.item.seq,
      type: item.item.type,
      mime: item.item.mime,
      content: item.item.content || item.file?.content, // Inline or separate content
      contentHash: item.item.contentHash,
      sizeBytes: item.item.sizeBytes,
      isEncrypted: item.item.isEncrypted,
      encryptionAlgorithm: item.item.encryptionAlgorithm,
      metadata: item.item.metadata ? (typeof item.item.metadata === 'string' ? JSON.parse(item.item.metadata) : item.item.metadata) : null,
      deviceId: deviceIdMapping[item.item.deviceId] || item.item.deviceId, // Map internal ID back to external ID
      createdAt: item.item.createdAt,
    }))

    return NextResponse.json({
      data: {
        items: transformedItems,
        lastSeq: latestSeq,
        deviceId: req.device.deviceId,
        count: transformedItems.length
      },
      error: null
    })
  } catch (error) {
    console.error('Error polling clipboard items:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to poll clipboard items' },
      { status: 500 }
    )
  }
})