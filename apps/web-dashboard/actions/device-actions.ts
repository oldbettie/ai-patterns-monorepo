// @feature:device-management @domain:devices @backend
// @summary: Server actions for device management operations

'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { registerDeviceSchema, renameDeviceSchema, manualAddDeviceSchema } from '@/lib/validation/devices'
import { secureFetch } from '@/lib/utils'
import { Device } from '@auto-paster/database/src/schemas'

// Serialized version of Device (for API responses where dates become strings)
type SerializedDevice = Omit<Device, 'createdAt' | 'updatedAt' | 'lastSeenAt'> & {
  createdAt: string
  updatedAt: string
  lastSeenAt: string
}

export async function getDevices() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  try {
    const response = await secureFetch<{ data: SerializedDevice[] | null, error: string | null }>('/api/core/v1/devices', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
    })

    return response
  } catch (error) {
    console.error('Failed to fetch devices:', error)
    return { data: null, error: 'Failed to fetch devices' }
  }
}

export async function registerCurrentDevice(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const ipAddress = formData.get('ipAddress') as string
  const userAgent = (await headers()).get('user-agent')
  
  // Generate a device ID based on browser/user info
  const deviceId = `browser_${session.user.id}_${Date.now()}`
  
  const deviceData = {
    deviceId,
    name,
    platform: 'linux' as const, // Default, could be detected from user agent
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
  }

  const parsed = registerDeviceSchema.safeParse(deviceData)
  if (!parsed.success) {
    return { data: null, error: parsed.error.flatten() }
  }

  try {
    const response = await secureFetch<{ data: Device | null, error: string | null }> (`/api/core/v1/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
      body: JSON.stringify(parsed.data),
    })

    revalidatePath('/dashboard')
    return response
  } catch (error) {
    console.error('Failed to register device:', error)
    return { data: null, error: 'Failed to register device' }
  }
}

export async function addManualDevice(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const ipAddress = formData.get('ipAddress') as string
  const tailscaleName = formData.get('tailscaleName') as string
  const platform = formData.get('platform') as string

  const manualData = {
    name,
    ipAddress: ipAddress || null,
    tailscaleName: tailscaleName || null,
    platform: platform as 'linux' | 'darwin' | 'windows' | undefined,
    isManual: true,
  }

  const parsed = manualAddDeviceSchema.safeParse(manualData)
  if (!parsed.success) {
    return { data: null, error: parsed.error.flatten() }
  }

  try {
    const response = await secureFetch<{ data: SerializedDevice | null, error: string | null }>('/api/core/v1/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
      body: JSON.stringify({ ...parsed.data, isManual: true }),
    })

    revalidatePath('/dashboard')
    return response
  } catch (error) {
    console.error('Failed to add manual device:', error)
    return { data: null, error: 'Failed to add device' }
  }
}

export async function renameDevice(deviceId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const parsed = renameDeviceSchema.safeParse({ name })
  if (!parsed.success) {
    return { data: null, error: parsed.error.flatten() }
  }

  try {
    const response = await secureFetch<{ data: SerializedDevice | null, error: string | null }>(`/api/core/v1/devices/${deviceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
      body: JSON.stringify(parsed.data),
    })

    revalidatePath('/dashboard')
    return response
  } catch (error) {
    console.error('Failed to rename device:', error)
    return { data: null, error: 'Failed to rename device' }
  }
}

export async function toggleDeviceUpdates(deviceId: string, receiveUpdates: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  try {
    const response = await secureFetch<{ data: SerializedDevice | null, error: string | null }>(`/api/core/v1/devices/${deviceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
      body: JSON.stringify({ receiveUpdates }),
    })

    revalidatePath('/dashboard')
    return response
  } catch (error) {
    console.error('Failed to toggle device updates:', error)
    return { data: null, error: 'Failed to update device settings' }
  }
}

export async function verifyDevice(deviceId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  try {
    const response = await secureFetch<{ data: SerializedDevice | null, error: string | null }>(`/api/core/v1/devices/${deviceId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
    })

    revalidatePath('/dashboard')
    return response
  } catch (error) {
    console.error('Failed to verify device:', error)
    return { data: null, error: 'Failed to verify device' }
  }
}

export async function generateVerificationToken(deviceId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  try {
    const response = await secureFetch<{ data: { token: string, verificationUrl: string } | null, error: string | null }>(`/api/core/v1/devices/${deviceId}/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
    })

    return response
  } catch (error) {
    console.error('Failed to generate verification token:', error)
    return { data: null, error: 'Failed to generate verification token' }
  }
}

export async function registerDevice(deviceData: { deviceId: string, name: string, platform: 'linux' | 'darwin' | 'windows' }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  const parsed = registerDeviceSchema.safeParse(deviceData)
  if (!parsed.success) {
    return { data: null, error: parsed.error.flatten() }
  }

  try {
    const response = await secureFetch<{ data: SerializedDevice | null, error: string | null }>('/api/core/v1/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
      body: JSON.stringify(parsed.data),
    })

    revalidatePath('/dashboard')
    revalidatePath('/setup')
    return response
  } catch (error) {
    console.error('Failed to register device:', error)
    return { data: null, error: 'Failed to register device' }
  }
}

export async function deleteDevice(deviceId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return { data: null, error: 'Unauthorized' }
  }

  try {
    const response = await secureFetch<{ data: { ok: boolean } | null, error: string | null }>(`/api/core/v1/devices/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': (await headers()).get('cookie') || '',
      },
    })

    revalidatePath('/dashboard')
    return response
  } catch (error) {
    console.error('Failed to delete device:', error)
    return { data: null, error: 'Failed to delete device' }
  }
}