'use client'
// @feature:pdf-editor @domain:pdf @frontend
// @summary: Modal for drawing and saving signatures using react-signature-canvas

import { useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { useTranslations } from 'next-intl'
import { v4 as uuidv4 } from 'uuid'
import type { StoredSignature } from '@quick-pdfs/common'

interface SignatureDrawingModalProps {
  onSave: (signature: StoredSignature) => void
  onClose: () => void
}

export function SignatureDrawingModal({ onSave, onClose }: SignatureDrawingModalProps) {
  const sigRef = useRef<SignatureCanvas>(null)
  const t = useTranslations('pages.editor.signature')

  const handleSave = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return
    const imageData = sigRef.current.toDataURL('image/png')
    const signature: StoredSignature = {
      id: uuidv4(),
      name: `Signature ${new Date().toLocaleDateString()}`,
      imageData,
      createdAt: Date.now(),
    }
    onSave(signature)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">{t('draw')}</h2>
        <div className="border-2 border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden mb-4">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              width: 400,
              height: 200,
              className: 'bg-white dark:bg-neutral-800 w-full',
            }}
            penColor="#000000"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => sigRef.current?.clear()}
            className="px-4 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {t('clear')}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
