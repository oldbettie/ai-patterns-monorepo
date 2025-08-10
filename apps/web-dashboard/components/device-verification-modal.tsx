// @feature:device-management @domain:devices @frontend
// @summary: Device verification modal with QR code and link generation

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { generateVerificationToken, verifyDevice } from '@/actions/device-actions'

interface DeviceVerificationModalProps {
  device: {
    id: string
    deviceId: string
    name: string
    verified: boolean
  }
  isOpen: boolean
  onClose: () => void
}

export function DeviceVerificationModal({ device, isOpen, onClose }: DeviceVerificationModalProps) {
  const t = useTranslations('pages.dashboard')
  const [verificationUrl, setVerificationUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleGenerateLink = async () => {
    setLoading(true)
    try {
      const result = await generateVerificationToken(device.deviceId)
      if (result.data) {
        setVerificationUrl(result.data.verificationUrl)
      } else {
        console.error('Failed to generate verification token:', result.error)
      }
    } catch (error) {
      console.error('Error generating verification token:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyNow = async () => {
    setLoading(true)
    try {
      const result = await verifyDevice(device.deviceId)
      if (result.data) {
        onClose()
      } else {
        console.error('Failed to verify device:', result.error)
      }
    } catch (error) {
      console.error('Error verifying device:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-xl border border-neutral-300 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {t('verificationRequired')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Verify device: <span className="font-medium">{device.name}</span>
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            {t('verificationDescription')}
          </p>
        </div>

        {!verificationUrl ? (
          <div className="space-y-4">
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? 'Generating...' : t('generateVerification')}
            </button>

            {/* Quick verify option if this is the current device */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">or</span>
              </div>
            </div>

            <button
              onClick={handleVerifyNow}
              disabled={loading}
              className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              {loading ? 'Verifying...' : 'Verify This Device Now'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Verification Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={verificationUrl}
                  readOnly
                  className="flex-1 rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <button
                  onClick={() => copyToClipboard(verificationUrl)}
                  className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
              <p className="font-medium mb-1">Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Copy the verification link above</li>
                <li>Open the link on the target device</li>
                <li>Confirm device verification</li>
                <li>The device will be ready to receive clipboard updates</li>
              </ol>
            </div>

            {/* QR Code Placeholder - In a real app you'd generate this */}
            <div className="flex justify-center">
              <div className="h-32 w-32 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center dark:border-neutral-700">
                <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="font-mono text-lg">QR</div>
                  <div>Code Here</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Close
          </button>
          {verificationUrl && (
            <button
              onClick={() => window.open(verificationUrl, '_blank')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Open Link
            </button>
          )}
        </div>
      </div>
    </div>
  )
}