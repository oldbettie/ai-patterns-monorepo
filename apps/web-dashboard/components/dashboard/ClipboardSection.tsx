"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn, timeAgo } from '@/lib/utils'
import type { ClipboardRow } from './types'
import { getClipboardItemsSince, getClipboardContent } from '@/actions/clipboard-actions'
import type { DashboardClipboardItem } from '@/lib/validation/clipboard'
import { copyToClipboard, getClipboardErrorMessage } from '@/lib/clipboard-utils'
import { EncryptionKeyInput } from './EncryptionKeyInput'
import { useEncryptionKey } from '@/components/hooks/useEncryptionKey'
import { decryptBase64AesGcm, isSupportedAlgorithm } from '@/lib/crypto/encryption-manager'
import { HttpWarning } from '@/components/HttpWarning'

interface ClipboardSectionProps {
  initialItems: ClipboardRow[]
}

export function ClipboardSection({ initialItems }: ClipboardSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [rows, setRows] = useState<ClipboardRow[]>(initialItems.slice(0, 50))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [retryCount, setRetryCount] = useState(0)
  const [lastSeq, setLastSeq] = useState(0) // For tracking sequence-based polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const isPageVisibleRef = useRef(true)
  const maxRetries = 3

  const [copyingItemId, setCopyingItemId] = useState<string | null>(null)
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const { getKey, hasKey } = useEncryptionKey()
  const [decryptedPreviews, setDecryptedPreviews] = useState<Record<string, string>>({})

  const formatBytes = (bytes?: number) => {
    if (!bytes && bytes !== 0) return '—'
    const thresh = 1024
    if (Math.abs(bytes) < thresh) return `${bytes} B`
    const units = ['KB', 'MB', 'GB', 'TB']
    let u = -1
    let value = bytes
    do {
      value /= thresh
      ++u
    } while (Math.abs(value) >= thresh && u < units.length - 1)
    return `${value.toFixed(1)} ${units[u]}`
  }

  // Transform API items to ClipboardRow format
  const transformApiItem = (item: DashboardClipboardItem): ClipboardRow => ({
    id: item.id,
    type: item.type,
    createdAt: item.createdAt,
    preview: item.preview,
    deviceName: item.deviceName,
    devicePlatform: item.devicePlatform,
    sizeBytes: item.sizeBytes,
    imageUrl: item.imageUrl,
    isEncrypted: item.isEncrypted,
    canDecrypt: item.canDecrypt,
    encryptedContent: item.encryptedContent,
    encryptionAlgorithm: item.encryptionAlgorithm,
    sourceDeviceId: item.sourceDeviceId,
  })
  // Attempt to decrypt previews for encrypted text items when key is available
  useEffect(() => {
    async function run() {
      if (!hasKey) return
      const targets = rows.filter(
        (r) => r.type === 'text' && r.isEncrypted && r.encryptedContent && isSupportedAlgorithm(r.encryptionAlgorithm) && !decryptedPreviews[r.id]
      )
      if (targets.length === 0) return
      const updates: Record<string, string> = {}
      await Promise.all(
        targets.map(async (r) => {
          try {
            console.log('🔄 Attempting to decrypt item:', r.id, 'algorithm:', r.encryptionAlgorithm)
            const key = await getKey()
            const decrypted = await decryptBase64AesGcm(r.encryptedContent as string, key)
            console.log('✅ Successfully decrypted item:', r.id, 'preview:', decrypted.substring(0, 50) + '...')
            updates[r.id] = decrypted.length > 100 ? `${decrypted.substring(0, 100)  }...` : decrypted
          } catch (error) {
            console.error('❌ Failed to decrypt item:', r.id, 'error:', error)
          }
        })
      )
      if (Object.keys(updates).length > 0) {
        setDecryptedPreviews((prev) => ({ ...prev, ...updates }))
      }
    }
    run()
  }, [hasKey, rows, decryptedPreviews, getKey])

  const hasEncryptedItems = useMemo(() => rows.some((r) => !!r.isEncrypted), [rows])
  const deviceIdHint = useMemo(() => {
    const candidate = rows.find((r) => r.isEncrypted && r.sourceDeviceId)
    return candidate?.sourceDeviceId
  }, [rows])
  const decryptedCount = useMemo(() => Object.keys(decryptedPreviews).length, [decryptedPreviews])

  const getDisplayPreview = useCallback((item: ClipboardRow) => {
    if (item.isEncrypted && decryptedPreviews[item.id]) {
      return decryptedPreviews[item.id]
    }
    return item.preview
  }, [decryptedPreviews])


  const poll = useCallback(async () => {
    if (!isPageVisibleRef.current) return
    try {
      setIsRefreshing(true)
      const result = await getClipboardItemsSince(lastSeq, 50)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      if (result.data && result.data.items.length > 0) {
        // Transform API items to ClipboardRow format
        const newItems = result.data.items.map(transformApiItem)
        
        // Add new items to the beginning of the list
        setRows(prev => {
          const combined = [...newItems, ...prev]
          // Remove duplicates by id and limit to 50
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values())
          return unique.slice(0, 50)
        })
        
        setLastSeq(result.data.lastSeq)
      }
      
      setLastUpdated(new Date())
      setRetryCount(0)
    } catch (e) {
      console.error('Clipboard polling error:', e)
      setRetryCount(prev => prev + 1)
    } finally {
      setIsRefreshing(false)
    }
  }, [lastSeq])

  const startPolling = useCallback(() => {
    if (pollingRef.current) return
    const baseInterval = 5000
    const backoffMultiplier = Math.min(Math.pow(2, retryCount), 8)
    const interval = baseInterval * backoffMultiplier
    pollingRef.current = setInterval(() => {
      if (retryCount < maxRetries) {
        poll()
      } else {
        stopPolling()
      }
    }, interval)
  }, [poll, retryCount])

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden
      if (document.hidden) {
        stopPolling()
      } else {
        setRetryCount(0)
        startPolling()
        poll()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    startPolling()
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopPolling()
    }
  }, [startPolling, stopPolling, poll])

  useEffect(() => {
    if (isPageVisibleRef.current && retryCount > 0) {
      stopPolling()
      startPolling()
    }
  }, [retryCount, startPolling, stopPolling])

  const handleCopyToClipboard = async (item: ClipboardRow) => {
    try {
      setCopyingItemId(item.id)
      setCopyError(null)
      
       let contentToCopy = getDisplayPreview(item)
      
      // For encrypted items, try to get the actual content
      if (item.isEncrypted) {
        console.log('🔄 Copying encrypted item:', item.id, 'has preview:', !!decryptedPreviews[item.id])
        
        if (decryptedPreviews[item.id]) {
          contentToCopy = decryptedPreviews[item.id]
          console.log('✅ Using cached preview for copy')
        } else {
          console.log('🔄 Fetching full content for copy')
          const contentResult = await getClipboardContent(item.id)
          console.log('📄 Content result:', contentResult)
          
          if (contentResult.data) {
            if (contentResult.data.isEncrypted && contentResult.data.encryptedContent && isSupportedAlgorithm(contentResult.data.encryptionAlgorithm)) {
              try {
                console.log('🔄 Attempting to decrypt for copy')
                const key = await getKey()
                const decrypted = await decryptBase64AesGcm(contentResult.data.encryptedContent, key)
                contentToCopy = decrypted
                console.log('✅ Successfully decrypted for copy:', decrypted.substring(0, 50) + '...')
              } catch (error) {
                console.error('❌ Failed to decrypt for copy:', error)
                // Fall back to placeholder below
              }
            } else if (contentResult.data.content) {
              contentToCopy = contentResult.data.content
              console.log('✅ Using unencrypted content for copy')
            }
          }
        }
        // If we can't decrypt, we'll use the preview as fallback
      }
      
      // Use the new clipboard utility that handles fallbacks
      await copyToClipboard(contentToCopy, item.type, item.imageUrl)
      
      setCopiedItemId(item.id)
      setTimeout(() => setCopiedItemId(curr => (curr === item.id ? null : curr)), 1200)
    } catch (err) {
      console.error('Failed to copy to clipboard', err)
      const errorMessage = getClipboardErrorMessage(err)
      setCopyError(errorMessage)
      setTimeout(() => setCopyError(null), 3000)
    } finally {
      setCopyingItemId(null)
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Recent Clipboard Activity</h2>
          {isRefreshing && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500" />
              Syncing...
            </div>
          )}
          <div className="text-xs text-neutral-400 dark:text-neutral-500">
            {rows.length} items • Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(v => !v)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
          aria-expanded={isExpanded}
          aria-controls="clipboard-section"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <HttpWarning />

      {hasEncryptedItems && (
        <div className="mt-3">
          <div className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
            {decryptedCount > 0 ? `${decryptedCount} item(s) decrypted` : 'Some items are encrypted. Enter your key to decrypt.'}
          </div>
          <EncryptionKeyInput />
        </div>
      )}

      {copyError && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-8h2v6h-2V9z"/>
            </svg>
            {copyError}
          </div>
        </div>
      )}

      <div
        id="clipboard-section"
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'mt-3 max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {rows.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            No clipboard items yet. Copy something from any connected device to see it here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Content Preview</th>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 pr-4">Size</th>
                  <th className="py-2 pr-4">Security</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-neutral-700 dark:text-neutral-300">
                {rows.map(item => (
                  <tr key={item.id} className="border-t border-neutral-200 dark:border-neutral-800">
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {item.type === 'text' && (
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M9 4h6a2 2 0 0 1 2 2v1h-2V6H9v12h6v-1h2v1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>
                          )}
                          {item.type === 'image' && (
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M5 5h14a2 2 0 0 1 2 2v10c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2Zm0 2v10h14V7H5Zm3 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm3 2 3 4 2-3 3 4H8l3-5Z"/></svg>
                          )}
                          {item.type === 'file' && (
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm1 7V3.5L19.5 9H15Z"/></svg>
                          )}
                        </span>
                        <span className="capitalize">{item.type}</span>
                      </span>
                    </td>
                     <td className="py-2 pr-4 max-w-[28rem] truncate" title={getDisplayPreview(item)}>{getDisplayPreview(item)}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {item.devicePlatform === 'darwin' && <span className="text-[10px]"></span>}
                          {item.devicePlatform === 'windows' && <span className="text-[10px]">⊞</span>}
                          {item.devicePlatform === 'linux' && <span className="text-[10px]">🐧</span>}
                          {item.devicePlatform === 'android' && <span className="text-[10px]">🤖</span>}
                          {item.devicePlatform === 'ios' && <span className="text-[10px]">📱</span>}
                        </span>
                        <span>{item.deviceName}</span>
                      </span>
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">{timeAgo(new Date(item.createdAt))}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{formatBytes(item.sizeBytes)}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {item.isEncrypted ? (
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', decryptedPreviews[item.id] ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300')}>
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                            <path d="M12 2C13.1 2 14 2.9 14 4V6H15.5C16.3 6 17 6.7 17 7.5V18.5C17 19.3 16.3 20 15.5 20H8.5C7.7 20 7 19.3 7 18.5V7.5C7 6.7 7.7 6 8.5 6H10V4C10 2.9 10.9 2 12 2ZM12 4C11.4 4 11 4.4 11 5V6H13V5C13 4.4 12.6 4 12 4Z"/>
                          </svg>
                          {decryptedPreviews[item.id] ? 'Decrypted' : 'Encrypted'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                            <path d="M12 2C13.1 2 14 2.9 14 4V5H15.5C16.3 5 17 5.7 17 6.5V18.5C17 19.3 16.3 20 15.5 20H8.5C7.7 20 7 19.3 7 18.5V6.5C7 5.7 7.7 5 8.5 5H10V4C10 2.9 10.9 2 12 2ZM12 3.5C11.2 3.5 10.5 4.2 10.5 5V5.5H13.5V5C13.5 4.2 12.8 3.5 12 3.5Z"/>
                          </svg>
                          Plain
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => handleCopyToClipboard(item)}
                        disabled={copyingItemId === item.id}
                        title={copiedItemId === item.id ? 'Copied!' : 'Copy to clipboard'}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition-colors',
                          copiedItemId === item.id
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                        )}
                      >
                        {copyingItemId === item.id ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="h-3 w-3 animate-spin rounded-full border border-blue-600 border-t-transparent" />
                            Copying...
                          </span>
                        ) : copiedItemId === item.id ? (
                          <span className="inline-flex items-center gap-1">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M9 16.17 4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z"/></svg>
                            Copied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14l4-4h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/></svg>
                            Copy
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

