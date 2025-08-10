// @feature:device-management @domain:dashboard @frontend
// @summary: Client-side dashboard with enhanced device management functionality

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { DeviceManagementModal } from './device-management-modal'
import { DeviceVerificationModal } from './device-verification-modal'
import { DevicesSection } from './dashboard/DevicesSection'
import { ClipboardSection } from './dashboard/ClipboardSection'
import { SectionHeader } from './dashboard/SectionHeader'
import { UserCard } from './dashboard/UserCard'
import type { Device, User, ClipboardRow } from './dashboard/types'
import { cn } from '@/lib/utils'


// Types for the dashboard data
// Types moved to feature module

interface DashboardClientProps {
  user: User
  devices: Device[]
  clipboardItems: ClipboardRow[]
}

export function DashboardClient({ user, devices: initialDevices, clipboardItems }: DashboardClientProps) {
  const t = useTranslations('pages.dashboard')
  const [showAddModal, setShowAddModal] = useState(false)
  const [verificationModal, setVerificationModal] = useState<{ device: Device; isOpen: boolean }>({
    device: null as any,
    isOpen: false
  })

  // Use clipboard rows from backend directly (no hardcoded samples)
  const initialClipboardRows: ClipboardRow[] = (clipboardItems || []).slice(0, 50)

  const onVerifyDevice = (device: Device) => setVerificationModal({ device, isOpen: true })

  return (
    <main className="container-balanced py-8 md:py-20">
      <SectionHeader title={t('title')} subtitle={t('subtitle')} />

      {/* User card */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <UserCard user={user} subscriptionLabel={t('subscriptionActive')} memberSinceLabel={t('memberSince')} />

        {/* Quick actions placeholder */}
        <div className="col-span-1 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
          <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Quick Actions</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/setup"
              className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-800 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
            >
              Device Setup
            </Link>
            <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              Pause Sync
            </button>
            <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              Clear History
            </button>
          </div>
        </div>

        {/* Placeholder column kept for layout parity; quick actions remain here */}
        <div className="col-span-1" />
      </section>

      <DevicesSection 
        initialDevices={initialDevices}
        onAddDevice={() => setShowAddModal(true)}
        onVerifyDevice={onVerifyDevice}
      />

      <ClipboardSection initialItems={initialClipboardRows} />

      {/* Modals */}
      <DeviceManagementModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
      <DeviceVerificationModal 
        device={verificationModal.device}
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ device: null as any, isOpen: false })}
      />
    </main>
  )
}