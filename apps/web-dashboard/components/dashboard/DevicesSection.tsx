"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import type { Device } from './types'
import { deleteDevice, getDevices, toggleDeviceUpdates } from '@/actions/device-actions'

interface DevicesSectionProps {
  initialDevices: Device[]
  onAddDevice?: () => void
  onVerifyDevice?: (device: Device) => void
}

export function DevicesSection({ initialDevices, onAddDevice, onVerifyDevice }: DevicesSectionProps) {
  const [devices, setDevices] = useState<Device[]>(initialDevices)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [deviceOperations, setDeviceOperations] = useState<Set<string>>(new Set())
  const [retryCount, setRetryCount] = useState(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPageVisibleRef = useRef(true)
  const maxRetries = 3

  const pollDevices = useCallback(async () => {
    if (!isPageVisibleRef.current) return
    try {
      setIsRefreshing(true)
      const result = await getDevices()
      if (result.data) {
        setDevices(result.data)
        setLastUpdated(new Date())
        setRetryCount(0)
      } else {
        setRetryCount(prev => prev + 1)
      }
    } catch (e) {
      setRetryCount(prev => prev + 1)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return
    const baseInterval = 12000
    const backoffMultiplier = Math.min(Math.pow(2, retryCount), 8)
    const interval = baseInterval * backoffMultiplier
    pollingIntervalRef.current = setInterval(() => {
      if (retryCount < maxRetries) {
        pollDevices()
      } else {
        stopPolling()
      }
    }, interval)
  }, [pollDevices, retryCount])

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
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
        pollDevices()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    startPolling()
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopPolling()
    }
  }, [startPolling, stopPolling, pollDevices])

  useEffect(() => {
    if (isPageVisibleRef.current && retryCount > 0) {
      stopPolling()
      startPolling()
    }
  }, [retryCount, startPolling, stopPolling])

  const handleToggleUpdates = async (device: Device, receiveUpdates: boolean) => {
    setDeviceOperations(prev => new Set(prev).add(device.deviceId))
    setDevices(prev => prev.map(d => d.deviceId === device.deviceId ? { ...d, receiveUpdates } : d))
    try {
      const result = await toggleDeviceUpdates(device.deviceId, receiveUpdates)
      if (result.error) throw new Error(result.error)
      pollDevices()
    } catch (e) {
      setDevices(prev => prev.map(d => d.deviceId === device.deviceId ? { ...d, receiveUpdates: !receiveUpdates } : d))
    } finally {
      setDeviceOperations(prev => { const s = new Set(prev); s.delete(device.deviceId); return s })
    }
  }

  const handleDeleteDevice = async (device: Device) => {
    if (!confirm(`Are you sure you want to delete "${device.name}"?`)) return
    setDeviceOperations(prev => new Set(prev).add(device.deviceId))
    try {
      const result = await deleteDevice(device.deviceId)
      if (result.error) throw new Error(result.error)
      setDevices(prev => prev.filter(d => d.deviceId !== device.deviceId))
    } finally {
      setDeviceOperations(prev => { const s = new Set(prev); s.delete(device.deviceId); return s })
    }
  }

  const getDeviceStatus = (device: Device) => {
    const lastSeen = new Date(device.lastSeenAt)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    return diffMinutes < 5 && device.isActive ? 'online' : 'offline'
  }

  const formatLastSeen = (lastSeenAt: string) => {
    const lastSeen = new Date(lastSeenAt)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    if (diffMinutes < 1) return 'now'
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }

  return (
    <section className="mt-6 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Devices</h2>
          {isRefreshing && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500" />
              Syncing...
            </div>
          )}
          <div className="text-xs text-neutral-400 dark:text-neutral-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        {onAddDevice && (
          <button 
            onClick={onAddDevice}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
          >
            Add Device
          </button>
        )}
      </div>

      {devices.length === 0 ? (
        <div className="mt-6 text-center py-8">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            <p className="font-medium">No devices</p>
            <p className="mt-1">Add your first device</p>
          </div>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-2 pr-4">Device</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Verification</th>
                <th className="py-2 pr-4">Updates</th>
                <th className="py-2 pr-4">Last Seen</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-neutral-700 dark:text-neutral-300">
              {devices.map((device) => {
                const status = getDeviceStatus(device)
                return (
                  <tr key={device.id} className="border-t border-neutral-200 dark:border-neutral-800">
                    <td className="py-2 pr-4">
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {device.platform} • {device.ipAddress || 'No IP'}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs ${
                        status === 'online'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status === 'online' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        {status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                          device.verified 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${device.verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {device.verified ? 'Verified' : 'Unverified'}
                        </span>
                        {!device.verified && onVerifyDevice && (
                          <button
                            onClick={() => onVerifyDevice(device)}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <ToggleSwitch
                        checked={device.receiveUpdates}
                        onChange={(checked) => handleToggleUpdates(device, checked)}
                        disabled={deviceOperations.has(device.deviceId)}
                        size="sm"
                        id={`toggle-${device.deviceId}`}
                        label={device.receiveUpdates ? 'Receives updates' : 'Updates disabled'}
                      />
                    </td>
                    <td className="py-2 pr-4">{formatLastSeen(device.lastSeenAt)}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDeleteDevice(device)}
                          disabled={deviceOperations.has(device.deviceId)}
                          className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deviceOperations.has(device.deviceId) ? (
                            <div className="flex items-center gap-1">
                              <div className="h-3 w-3 animate-spin rounded-full border border-red-600 border-t-transparent" />
                              Deleting...
                            </div>
                          ) : (
                            'Revoke'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

