// @feature:device-setup @domain:setup @frontend
// @summary: Client-side setup interface for device encryption configuration

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Device, User } from '@/components/dashboard/types'

interface PendingDeviceRegistration {
  token: string
  userId: string
  deviceIdPrefix: string
  detectedDeviceId: string | null
  detectedName: string | null
  detectedPlatform: string | null
  userApproved: boolean
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}
import { DeviceSetupWizard } from './device-setup-wizard'
import { PendingDeviceRegistration as PendingDeviceRegistrationComponent } from './pending-device-registration'

interface SetupClientProps {
  user: User
  devices: Device[]
  pendingRegistration?: PendingDeviceRegistration | null
}

export function SetupClient({ user, devices, pendingRegistration }: SetupClientProps) {
  const router = useRouter()
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [showWizard, setShowWizard] = useState(false)

  const unverifiedDevices = devices.filter(device => !device.verified)
  const verifiedDevices = devices.filter(device => device.verified)

  const handleSetupDevice = (device: Device) => {
    setSelectedDevice(device)
    setShowWizard(true)
  }

  const handleSetupComplete = () => {
    setShowWizard(false)
    setSelectedDevice(null)
    // Refresh the page to get updated device status
    router.refresh()
  }

  const handleRegistrationComplete = () => {
    // Refresh the page to show updated devices list
    router.refresh()
  }

  return (
    <main className="container-balanced py-8 md:py-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          Device Setup & Encryption
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Set up your devices for secure clipboard synchronization
        </p>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Pending Device Registration */}
      {pendingRegistration && (
        <div className="mb-8">
          <PendingDeviceRegistrationComponent
            token={pendingRegistration.token}
            deviceIdPrefix={pendingRegistration.deviceIdPrefix}
            detectedName={pendingRegistration.detectedName || undefined}
            detectedPlatform={pendingRegistration.detectedPlatform || undefined}
            detectedDeviceId={pendingRegistration.detectedDeviceId || undefined}
            onRegistrationComplete={handleRegistrationComplete}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Setup Instructions */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            How It Works
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-50">Add Device</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Install the clipboard agent on your device and register it with your account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-50">Verify Device</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Confirm the device identity to ensure secure communication
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-50">Setup Encryption</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Generate API keys and configure end-to-end encryption for your clipboard data
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50">
            <div className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Note</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Your encryption keys are generated locally and never stored on our servers. 
                  Keep your master passphrase safe - we cannot recover it if lost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Device List */}
        <div className="rounded-xl border border-neutral-300 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
            Your Devices
          </h2>

          {devices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-neutral-500 dark:text-neutral-400">
                <p className="font-medium">No devices found</p>
                <p className="text-sm mt-1">Install the clipboard agent on your devices to get started</p>
              </div>
              <div className="mt-4">
                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Download Clipboard Agent
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Verified Devices */}
              {verifiedDevices.length > 0 && (
                <div>
                  <h3 className="font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                    ✅ Ready to Use ({verifiedDevices.length})
                  </h3>
                  <div className="space-y-2">
                    {verifiedDevices.map(device => (
                      <div key={device.id} className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {device.platform === 'darwin' && '🍎'}
                              {device.platform === 'windows' && '🪟'}
                              {device.platform === 'linux' && '🐧'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-50">
                              {device.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {device.platform} • Last seen {new Date(device.lastSeenAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unverified Devices */}
              {unverifiedDevices.length > 0 && (
                <div>
                  <h3 className="font-medium text-amber-700 dark:text-amber-300 mb-2">
                    ⚠️ Needs Setup ({unverifiedDevices.length})
                  </h3>
                  <div className="space-y-2">
                    {unverifiedDevices.map(device => (
                      <div key={device.id} className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                            <span className="text-amber-600 dark:text-amber-400">
                              {device.platform === 'darwin' && '🍎'}
                              {device.platform === 'windows' && '🪟'}
                              {device.platform === 'linux' && '🐧'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-50">
                              {device.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {device.platform} • Added {new Date(device.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSetupDevice(device)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                          Setup
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Setup Wizard Modal */}
      {showWizard && selectedDevice && (
        <DeviceSetupWizard
          device={selectedDevice}
          user={user}
          onComplete={handleSetupComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </main>
  )
}