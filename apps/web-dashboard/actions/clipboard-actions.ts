// @feature:clipboard-actions @domain:clipboard @frontend
// @summary: Server actions for clipboard operations in dashboard

'use server'

import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClipboardService } from '@/lib/services/clipboardService'
import { DeviceRepository } from '@auto-paster/database/src/repositories/deviceRepository'
import { db } from '@auto-paster/database/src/database'
import type { 
  ClipboardItemWithContentResponse, 
  DashboardClipboardItem 
} from '@/lib/validation/clipboard'

/**
 * Get recent clipboard items for dashboard display
 */
export async function getRecentClipboardItems(limit: number = 50): Promise<{
  data: DashboardClipboardItem[] | null
  error: string | null
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      redirect('/login')
    }

    const clipboardService = createClipboardService({
      user: session.user,
      session: session.session,
    })

    // Get recent items
    const items = await clipboardService.getRecentItems(limit)

    // Get device information for display names
    const deviceRepository = new DeviceRepository(db)
    const devices = await deviceRepository.getUserDevices(session.user.id)
    // Map by internal device ID because clipboard items store internal IDs
    const deviceMap = new Map(devices.map(d => [d.id, d]))

    // Transform to dashboard format
    const dashboardItems: DashboardClipboardItem[] = items.map(itemWithContent => {
      const item = itemWithContent.item
      const device = deviceMap.get(item.deviceId)
      
      // Generate preview based on type
      let preview = ''
      let imageUrl: string | undefined
      
      if (item.type === 'text') {
        // For encrypted content, show placeholder until decryption
        if (item.isEncrypted) {
          preview = '🔐 [Encrypted content - click to copy]'
        } else {
          // Unencrypted content - show preview
          const content = item.content || itemWithContent.file?.content || ''
          preview = content.length > 100 ? content.substring(0, 100) + '...' : content
        }
      } else if (item.type === 'image') {
        if (item.metadata) {
          const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
          preview = `[Image ${metadata.width || '?'}x${metadata.height || '?'}]`
        } else {
          preview = '[Image]'
        }
        // For now, we don't support image display of encrypted images
        if (!item.isEncrypted && item.content) {
          imageUrl = `data:${item.mime || 'image/png'};base64,${item.content}`
        }
      } else if (item.type === 'file') {
        if (item.metadata) {
          const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
          preview = metadata.filename || `[File ${formatBytes(item.sizeBytes)}]`
        } else {
          preview = `[File ${formatBytes(item.sizeBytes)}]`
        }
      }

      return {
        id: item.id,
        type: item.type as 'text' | 'image' | 'file',
        createdAt: item.createdAt.toISOString(),
        preview,
        deviceName: device?.name || 'Unknown Device',
        devicePlatform: (device?.platform as any) || 'unknown',
        sizeBytes: item.sizeBytes,
        imageUrl,
        isEncrypted: item.isEncrypted,
        canDecrypt: !!item.isEncrypted,
        encryptedContent: item.isEncrypted ? (item.content || itemWithContent.file?.content || undefined) : undefined,
        encryptionAlgorithm: item.encryptionAlgorithm || undefined,
        sourceDeviceId: device?.deviceId,
      }
    })

    return { data: dashboardItems, error: null }
  } catch (error) {
    console.error('Error getting clipboard items:', error)
    return { data: null, error: 'Failed to load clipboard items' }
  }
}

/**
 * Get clipboard items since a specific sequence number (for polling)
 */
export async function getClipboardItemsSince(since: number, limit: number = 50): Promise<{
  data: { items: DashboardClipboardItem[], lastSeq: number } | null
  error: string | null
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return { data: null, error: 'Not authenticated' }
    }

    const clipboardService = createClipboardService({
      user: session.user,
      session: session.session,
    })

    // Get items since sequence number
    const items = await clipboardService.getItemsSince(since, limit)

    // Get latest sequence for client tracking
    const latestSeq = items.length > 0 
      ? Math.max(...items.map(item => item.item.seq))
      : await clipboardService.getLatestSeq()

    // Get device information
    const deviceRepository = new DeviceRepository(db)
    const devices = await deviceRepository.getUserDevices(session.user.id)
    // Map by internal device ID because clipboard items store internal IDs
    const deviceMap = new Map(devices.map(d => [d.id, d]))

    // Transform items same as above
    const dashboardItems: DashboardClipboardItem[] = items.map(itemWithContent => {
      const item = itemWithContent.item
      const device = deviceMap.get(item.deviceId)
      
      let preview = ''
      let imageUrl: string | undefined
      
      if (item.type === 'text') {
        if (item.isEncrypted) {
          preview = '🔐 [Encrypted content]'
        } else {
          const content = item.content || itemWithContent.file?.content || ''
          preview = content.length > 100 ? content.substring(0, 100) + '...' : content
        }
      } else if (item.type === 'image') {
        if (item.metadata) {
          const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
          preview = `[Image ${metadata.width || '?'}x${metadata.height || '?'}]`
        } else {
          preview = '[Image]'
        }
        if (!item.isEncrypted && item.content) {
          imageUrl = `data:${item.mime || 'image/png'};base64,${item.content}`
        }
      } else if (item.type === 'file') {
        if (item.metadata) {
          const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
          preview = metadata.filename || `[File ${formatBytes(item.sizeBytes)}]`
        } else {
          preview = `[File ${formatBytes(item.sizeBytes)}]`
        }
      }

      return {
        id: item.id,
        type: item.type as 'text' | 'image' | 'file',
        createdAt: item.createdAt.toISOString(),
        preview,
        deviceName: device?.name || 'Unknown Device',
        devicePlatform: (device?.platform as any) || 'unknown',
        sizeBytes: item.sizeBytes,
        imageUrl,
        isEncrypted: item.isEncrypted,
        canDecrypt: !!item.isEncrypted,
        encryptedContent: item.isEncrypted ? (item.content || itemWithContent.file?.content || undefined) : undefined,
        encryptionAlgorithm: item.encryptionAlgorithm || undefined,
        sourceDeviceId: device?.deviceId,
      }
    })

    return { 
      data: { items: dashboardItems, lastSeq: latestSeq }, 
      error: null 
    }
  } catch (error) {
    console.error('Error getting clipboard items since:', error)
    return { data: null, error: 'Failed to load clipboard items' }
  }
}

/**
 * Get raw clipboard content for copying (attempts to decrypt if possible)
 */
export async function getClipboardContent(itemId: string): Promise<{
  data: { content: string, type: string, isEncrypted?: boolean, encryptedContent?: string, encryptionAlgorithm?: string, sourceDeviceId?: string } | null
  error: string | null
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
      return { data: null, error: 'Not authenticated' }
    }

    const clipboardService = createClipboardService({
      user: session.user,
      session: session.session,
    })

    const itemWithContent = await clipboardService.getItemById(itemId)
    if (!itemWithContent) {
      return { data: null, error: 'Item not found' }
    }

    const item = itemWithContent.item
    const content = item.content || itemWithContent.file?.content || ''

    if (item.isEncrypted) {
      const deviceRepository = new DeviceRepository(db)
      const device = await deviceRepository.getDeviceById(item.deviceId)
      return {
        data: {
          content: '',
          type: item.type,
          isEncrypted: true,
          encryptedContent: content,
          encryptionAlgorithm: item.encryptionAlgorithm || undefined,
          sourceDeviceId: device?.deviceId,
        },
        error: null,
      }
    }

    return {
      data: { content, type: item.type },
      error: null
    }
  } catch (error) {
    console.error('Error getting clipboard content:', error)
    return { data: null, error: 'Failed to get clipboard content' }
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}