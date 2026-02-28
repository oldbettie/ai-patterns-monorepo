'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: WiFi QR code tool — share network credentials via QR

import { useState } from 'react'
import { useQRTool } from '@/components/hooks/useQRTool'
import { QRToolLayout } from '@/components/qr/QRToolLayout'
import { WiFiForm } from '@/components/qr/forms/WiFiForm'
import type { WiFiFormData } from '@/components/qr/forms/WiFiForm'
import { formatWiFi } from '@/lib/qr/qrTypes'
import { useTranslations } from 'next-intl'

const DEFAULT_DATA: WiFiFormData = {
  ssid: '',
  password: '',
  encryption: 'WPA',
  hidden: false,
}

export function WiFiToolClient() {
  const t = useTranslations('pages.generate.tools.wifi')
  const [formData, setFormData] = useState<WiFiFormData>(DEFAULT_DATA)
  const { data, setData, qrRef, options, setOptions, saving, handleSave,
    handleLoad, entries, loading, deleteEntry, renameEntry } = useQRTool('wifi')

  const handleFormChange = (fd: WiFiFormData) => {
    setFormData(fd)
    if (fd.ssid) {
      setData(formatWiFi(fd))
    } else {
      setData('')
    }
  }

  return (
    <QRToolLayout
      title={t('pageTitle')}
      description={t('pageDescription')}
      data={data}
      qrRef={qrRef}
      options={options}
      onOptionsChange={setOptions}
      saving={saving}
      onSave={() => handleSave(formData.ssid || 'WiFi')}
      entries={entries}
      historyLoading={loading}
      onLoad={handleLoad}
      onDelete={deleteEntry}
      onRename={renameEntry}
      downloadLabel="wifi-qr"
      placeholder={t('placeholder')}
    >
      <WiFiForm value={formData} onChange={handleFormChange} />
    </QRToolLayout>
  )
}
