// @feature:device-setup @domain:setup @frontend
// @summary: Step-by-step wizard for device encryption setup

'use client'

import { useState } from 'react'
import type { Device, User } from '@/components/dashboard/types'

interface DeviceSetupWizardProps {
  device: Device
  user: User
  onComplete: () => void
  onCancel: () => void
}

type SetupStep = 'verify' | 'encryption' | 'apikey' | 'complete'

export function DeviceSetupWizard({ device, user, onComplete, onCancel }: DeviceSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('verify')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null)

  const handleVerifyDevice = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // TODO: Call verify device API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      setCurrentStep('encryption')
    } catch (err) {
      setError('Failed to verify device. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateApiKey = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // TODO: Call generate API key endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      const mockApiKey = `cpb_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      setGeneratedApiKey(mockApiKey)
      setCurrentStep('complete')
    } catch (err) {
      setError('Failed to generate API key. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'verify': return 'Verify Device'
      case 'encryption': return 'Setup Encryption'
      case 'apikey': return 'Generate API Key'
      case 'complete': return 'Setup Complete'
      default: return 'Device Setup'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                {getStepTitle()}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Setting up {device.name} ({device.platform})
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Verify Device */}
          {currentStep === 'verify' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Device Verification</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Confirm this device belongs to you and establish secure communication.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-50">Device Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">Name:</span>
                    <span className="ml-2 text-neutral-900 dark:text-neutral-50">{device.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">Platform:</span>
                    <span className="ml-2 text-neutral-900 dark:text-neutral-50">{device.platform}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">IP Address:</span>
                    <span className="ml-2 text-neutral-900 dark:text-neutral-50">{device.ipAddress || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">Device ID:</span>
                    <span className="ml-2 text-neutral-900 dark:text-neutral-50 font-mono text-xs">{device.deviceId.substring(0, 12)}...</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyDevice}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Device'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Encryption Setup */}
          {currentStep === 'encryption' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4V6H15.5C16.3 6 17 6.7 17 7.5V18.5C17 19.3 16.3 20 15.5 20H8.5C7.7 20 7 19.3 7 18.5V7.5C7 6.7 7.7 6 8.5 6H10V4C10 2.9 10.9 2 12 2Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-green-900 dark:text-green-100">Encryption Configuration</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Your device needs to be configured with encryption settings.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-50 mb-2">
                    Desktop App Instructions
                  </h4>
                  <ol className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2 list-decimal list-inside">
                    <li>Run the clipboard agent with setup mode: <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">clipboard-agent --setup</code></li>
                    <li>Create a strong master passphrase when prompted</li>
                    <li>The agent will generate device-specific encryption keys</li>
                    <li>Return here to continue setup</li>
                  </ol>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">Important Security Note</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        Your encryption passphrase is never sent to our servers. Make sure to remember it - 
                        we cannot recover it if lost. You&apos;ll need the same passphrase on all your devices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep('verify')}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('apikey')}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Encryption Configured
                </button>
              </div>
            </div>
          )}

          {/* Step 3: API Key Generation */}
          {currentStep === 'apikey' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="currentColor">
                    <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31.84 2.41 2 2.83V22h2v-2.17c1.16-.41 2-1.51 2-2.83 0-1.66-1.34-3-3-3zm13-7h-2v4h-4v2h4v4h2v-4h4V9h-4V5z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-purple-900 dark:text-purple-100">API Key Generation</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Generate a secure API key for device authentication.
                  </p>
                </div>
              </div>

              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                <p>
                  The API key will allow your device to securely communicate with the clipboard service. 
                  This key will be used to authenticate all requests from your device.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setCurrentStep('encryption')}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateApiKey}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate API Key'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 'complete' && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-600 dark:text-green-400" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
                  Setup Complete!
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                  {device.name} is now ready for secure clipboard synchronization.
                </p>
              </div>

              {generatedApiKey && (
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-50 mb-2">
                    Your API Key
                  </h4>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded">
                      {generatedApiKey}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedApiKey)}
                      className="px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Add this to your device&apos;s environment: <code>CLIPBOARD_API_KEY={generatedApiKey}</code>
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={onComplete}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                >
                  Finish Setup
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}