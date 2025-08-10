// @feature:device-management @domain:devices @frontend
// @summary: Device management modal with add device options and device verification

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { registerCurrentDevice, addManualDevice } from '@/actions/device-actions'

interface DeviceManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

type AddMode = 'choose' | 'this-device' | 'manual'

export function DeviceManagementModal({ isOpen, onClose }: DeviceManagementModalProps) {
  const t = useTranslations('pages.dashboard.addDeviceModal')
  const [mode, setMode] = useState<AddMode>('choose')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleThisDeviceSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      const result = await registerCurrentDevice(formData)
      if (result.data) {
        onClose()
        setMode('choose')
      } else {
        console.error('Failed to add device:', result.error)
      }
    } catch (error) {
      console.error('Error adding device:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      const result = await addManualDevice(formData)
      if (result.data) {
        onClose()
        setMode('choose')
      } else {
        console.error('Failed to add device:', result.error)
      }
    } catch (error) {
      console.error('Error adding device:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setMode('choose')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-neutral-300 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {t('title')}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t('description')}
          </p>
        </div>

        {mode === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('this-device')}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-left hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {t('thisDevice.title')}
              </div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {t('thisDevice.description')}
              </div>
            </button>
            
            <button
              onClick={() => setMode('manual')}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-left hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {t('manual.title')}
              </div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {t('manual.description')}
              </div>
            </button>
          </div>
        )}

        {mode === 'this-device' && (
          <form action={handleThisDeviceSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('thisDevice.form.deviceName')}
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder={t('thisDevice.form.deviceNamePlaceholder')}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('thisDevice.form.ipAddress')}
              </label>
              <input
                name="ipAddress"
                type="text"
                placeholder={t('thisDevice.form.ipAddressPlaceholder')}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? 'Adding...' : t('thisDevice.form.submit')}
              </button>
            </div>
          </form>
        )}

        {mode === 'manual' && (
          <form action={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('manual.form.deviceName')}
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder={t('manual.form.deviceNamePlaceholder')}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('manual.form.ipAddress')}
              </label>
              <input
                name="ipAddress"
                type="text"
                placeholder={t('manual.form.ipAddressPlaceholder')}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('manual.form.tailscaleName')}
              </label>
              <input
                name="tailscaleName"
                type="text"
                placeholder={t('manual.form.tailscaleNamePlaceholder')}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {t('manual.form.platform')}
              </label>
              <select
                name="platform"
                defaultValue="linux"
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="linux">{t('manual.form.linux')}</option>
                <option value="darwin">{t('manual.form.darwin')}</option>
                <option value="windows">{t('manual.form.windows')}</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? 'Adding...' : t('manual.form.submit')}
              </button>
            </div>
          </form>
        )}

        {mode === 'choose' && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClose}
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}