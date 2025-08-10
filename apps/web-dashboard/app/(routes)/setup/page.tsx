// @feature:device-setup @domain:setup @frontend
// @summary: Device setup page for encryption configuration

import { auth } from '@/lib/auth/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SetupClient } from '@/components/setup/setup-client'
import { getDevices } from '@/actions/device-actions'
import { createDeviceRegistrationService } from '@/lib/services/deviceRegistrationService.temp'

interface PendingDeviceRegistration {
  token: string
  userId: string
  deviceIdPrefix: string
  detectedDeviceId: string | null
  detectedName: string | null
  detectedPlatform: string | null
  userApproved: boolean
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export default async function SetupPage({
  searchParams
}: {
  searchParams: Promise<{ device_token?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const params = await searchParams
  let pendingRegistration: PendingDeviceRegistration | null = null
  
  // Handle device registration if device_token is provided
  if (params.device_token) {
    console.log('Setup page visited with device_token:', params.device_token)
    
    const deviceRegistrationService = createDeviceRegistrationService()
    
    // Parse the device token format: dev_<deviceIdPrefix>_<timestamp>
    const tokenInfo = deviceRegistrationService.parseRegistrationToken(params.device_token)
    
    if (tokenInfo) {
      console.log('Parsed token info:', tokenInfo)
      
      // Check if we already have a pending registration for this token
      pendingRegistration = await deviceRegistrationService.getPendingRegistration(params.device_token)
      
      if (!pendingRegistration) {
        // Create a new pending registration
        try {
          pendingRegistration = await deviceRegistrationService.createPendingRegistration({
            token: params.device_token,
            userId: session.user.id,
            deviceIdPrefix: tokenInfo.deviceIdPrefix,
          })
          
          console.log('Created pending registration:', pendingRegistration.token)
        } catch (error) {
          console.error('Failed to create pending registration:', error)
        }
      } else {
        console.log('Found existing pending registration:', pendingRegistration.token)
      }
    }
  }

  // Fetch user's devices
  const devicesResult = await getDevices()
  const devices = devicesResult.data || []

  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    createdAt: session.user.createdAt.toISOString(),
    updatedAt: session.user.updatedAt.toISOString(),
    image: session.user.image,
  }

  return (
    <SetupClient 
      user={userData}
      devices={devices}
      pendingRegistration={pendingRegistration}
    />
  )
}