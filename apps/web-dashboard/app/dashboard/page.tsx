import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard-client'
import { getDevices } from '@/actions/device-actions'
import { getRecentClipboardItems } from '@/actions/clipboard-actions'
import type { ClipboardRow } from '@/components/dashboard/types'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  // Fetch devices via server action
  const devicesResult = await getDevices()
  const devices = devicesResult.data || []

  // Fetch recent clipboard items from the real API
  const clipboardResult = await getRecentClipboardItems(50)
  const clipboardItems = clipboardResult.data || []

  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    createdAt: new Date(session.user.createdAt ?? Date.now()).toISOString(),
  }

  // Transform clipboard items to the `ClipboardRow` format expected by the client component
  const transformedClipboardItems: ClipboardRow[] = clipboardItems.map(item => ({
    id: item.id,
    type: item.type,
    createdAt: item.createdAt,
    preview: item.preview,
    deviceName: item.deviceName,
    devicePlatform: item.devicePlatform as ClipboardRow['devicePlatform'],
    sizeBytes: item.sizeBytes,
    imageUrl: item.imageUrl,
    isEncrypted: item.isEncrypted,
    canDecrypt: item.canDecrypt,
    encryptedContent: item.encryptedContent,
    encryptionAlgorithm: item.encryptionAlgorithm,
    sourceDeviceId: item.sourceDeviceId,
  }))

  return (
    <DashboardClient 
      user={userData}
      devices={devices}
      clipboardItems={transformedClipboardItems}
    />
  )
}