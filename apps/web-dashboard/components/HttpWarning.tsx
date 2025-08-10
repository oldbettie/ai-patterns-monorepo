'use client'

import { shouldShowHttpWarning } from '@/lib/crypto/encryption-manager'
import { useState, useEffect } from 'react'

export function HttpWarning() {
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    setShowWarning(shouldShowHttpWarning())
  }, [])

  if (!showWarning) return null

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4 dark:border-red-800 dark:bg-red-900/30">
      <div className="flex items-start">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            🔒 Encryption Not Available
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>
              Clipboard content cannot be decrypted because you&apos;re accessing this dashboard over HTTP.
              For security, encryption requires HTTPS or localhost access.
            </p>
            <p className="mt-2 font-medium">
              To decrypt clipboard content:
            </p>
            <ul className="mt-1 list-disc list-inside">
              <li>Access the dashboard via <code className="bg-red-100 dark:bg-red-800 px-1 rounded">localhost</code></li>
              <li>Or enable HTTPS on your server</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}