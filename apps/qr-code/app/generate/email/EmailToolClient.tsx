'use client'
// @feature:qr-generator @domain:qr @frontend
// @summary: Email QR code tool — pre-fill an email with recipient, subject, and body

import { useState } from 'react'
import { useQRTool } from '@/components/hooks/useQRTool'
import { QRToolLayout } from '@/components/qr/QRToolLayout'
import { EmailForm } from '@/components/qr/forms/EmailForm'
import type { EmailFormData } from '@/components/qr/forms/EmailForm'
import { formatEmail } from '@/lib/qr/qrTypes'
import { useTranslations } from 'next-intl'

const DEFAULT_DATA: EmailFormData = {
  to: '',
  subject: '',
  body: '',
}

export function EmailToolClient() {
  const t = useTranslations('pages.generate.tools.email')
  const [formData, setFormData] = useState<EmailFormData>(DEFAULT_DATA)
  const { data, setData, qrRef, options, setOptions, saving, handleSave,
    handleLoad, entries, loading, deleteEntry, renameEntry } = useQRTool('email')

  const handleFormChange = (fd: EmailFormData) => {
    setFormData(fd)
    if (fd.to) {
      setData(formatEmail(fd))
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
      onSave={() => handleSave(formData.to || 'Email')}
      entries={entries}
      historyLoading={loading}
      onLoad={handleLoad}
      onDelete={deleteEntry}
      onRename={renameEntry}
      downloadLabel="email-qr"
      placeholder={t('placeholder')}
    >
      <EmailForm value={formData} onChange={handleFormChange} />
    </QRToolLayout>
  )
}
