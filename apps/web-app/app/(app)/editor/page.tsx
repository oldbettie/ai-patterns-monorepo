import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { DashboardClient } from '@/components/dashboard-client'
import type { User } from '@/components/dashboard/types'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('pages.dashboard')
  return {
    title: t('title'),
    description: t('subtitle')
  }
}

export default async function EditorDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const user: User | null = session
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        createdAt: new Date(session.user.createdAt ?? Date.now()).toISOString(),
      }
    : null

  return <DashboardClient user={user} />
}
