// @feature:device-setup @domain:setup @frontend
// @summary: Component for handling pending device registrations with auto-detection

'use client'

import { useState } from 'react'
import { registerDevice } from '@/actions/device-actions'

interface PendingDeviceRegistrationProps {
  token: string
  deviceIdPrefix: string
  detectedName?: string
  detectedPlatform?: string
  detectedDeviceId?: string
  onRegistrationComplete: () => void
}

export function PendingDeviceRegistration({
  token,
  deviceIdPrefix,
  detectedName,
  detectedPlatform,
  detectedDeviceId,
  onRegistrationComplete,
}: PendingDeviceRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [deviceName, setDeviceName] = useState(detectedName || extractHostnameFromPrefix(deviceIdPrefix))
  const [error, setError] = useState<string | null>(null)

  // Extract hostname from device ID prefix (e.g., "linux-be" -> "be")
  function extractHostnameFromPrefix(prefix: string): string {
    const parts = prefix.split('-')
    return parts.length > 1 ? parts[1] : prefix
  }

  // Get platform display name and icon
  function getPlatformInfo(platform?: string) {
    switch (platform) {
      case 'linux':
        return { name: 'Linux', icon: '🐧' }
      case 'darwin':
        return { name: 'macOS', icon: '🍎' }
      case 'windows':
        return { name: 'Windows', icon: '🪟' }
      default:
        return { name: 'Unknown', icon: '💻' }
    }
  }

  const platformInfo = getPlatformInfo(detectedPlatform)

  const handleApproveDevice = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Register the device using the detected or constructed device ID
      const deviceIdToRegister = detectedDeviceId || `${deviceIdPrefix}-${Date.now()}-generated`
      
      const result = await registerDevice({
        deviceId: deviceIdToRegister,
        name: deviceName.trim(),
        platform: (detectedPlatform as 'linux' | 'darwin' | 'windows') || 'linux',
      })

      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : 'Failed to register device')
        return
      }

      onRegistrationComplete()
    } catch (err) {
      console.error('Error registering device:', err)
      setError('Failed to register device. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-2xl">
          {platformInfo.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              New Device Detected
            </h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
              {platformInfo.name}
            </span>
          </div>
          
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
            A clipboard agent on <strong>{detectedName || 'your device'}</strong> is requesting access to your account.
          </p>

          {detectedDeviceId && (
            <div className="mb-4 p-3 rounded-lg bg-white dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Device Details
              </h4>
              <p className="text-xs text-blue-600 dark:text-blue-300 font-mono">
                ID: {detectedDeviceId}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label htmlFor="deviceName" className="block text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Device Name
              </label>
              <input
                type="text"
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Enter a name for this device"
                className="w-full px-3 py-2 text-sm border border-blue-200 dark:border-blue-700 rounded-md bg-white dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleApproveDevice}
                disabled={isLoading || !deviceName.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Adding Device...
                  </span>
                ) : (
                  'Add This Device'
                )}
              </button>
              
              <button
                onClick={() => {
                  // For now, just ignore the request
                  // In the future, could add a "reject" functionality
                  onRegistrationComplete()
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/40 border border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/60 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}