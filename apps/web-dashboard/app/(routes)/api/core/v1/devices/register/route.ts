// @feature:device-registration @domain:devices @api
// @summary: API endpoint for device registration token handling and device creation

import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createDeviceRegistrationService } from "@/lib/services/deviceRegistrationService.temp"
import { registerDeviceSchema } from "@/lib/validation/devices"
import { DeviceRepository } from "@auto-paster/database/src/repositories/deviceRepository"
import { db } from "@auto-paster/database/src/database"
import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"
import { randomBytes } from "crypto"

/**
 * Check if device registration token is valid and create device
 * GET /api/core/v1/devices/register?token=xxx
 * 
 * Returns: { data: { apiKey: string, deviceId: string }, error: null }
 */
/**
 * Register device and get API key
 * POST /api/core/v1/devices/register
 * 
 * Body: { token: string, deviceId: string, name: string, platform: string }
 * Returns: { data: { apiKey: string, deviceId: string }, error: null }
 */
export const POST = createRouteHandler({ isPublic: true }, async (req) => {
  try {
    const body = await req.json()
    console.log('Registration request body:', body)

    // Validate required fields
    const parsed = registerDeviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Try to get a web session (browser-based auth)
    const session = await auth.api.getSession({ headers: await headers() })

    if (session) {
      // Authenticated browser flow: register directly to user
      const deviceRepository = new DeviceRepository(db)
      const apiKey = `cpb_${randomBytes(32).toString('base64url')}`
      const device = await deviceRepository.upsertDevice({
        userId: session.user.id,
        deviceId: parsed.data.deviceId,
        name: parsed.data.name,
        platform: parsed.data.platform,
        ipAddress: parsed.data.ipAddress ?? null,
        userAgent: parsed.data.userAgent ?? null,
        apiKey,
        verified: true,
        receiveUpdates: true,
        isActive: true,
      })
      await deviceRepository.verifyDevice(device.deviceId)
      return NextResponse.json({ data: { apiKey, deviceId: device.deviceId, expiresAt: null }, error: null })
    }

    // Agent flow: require token and use temp registration service
    const { token } = body as { token?: string }
    if (!token) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized: missing session or registration token' },
        { status: 401 }
      )
    }

    // Token/deviceId-based flow without using service generateApiKey
    const deviceRegistrationService = createDeviceRegistrationService()
    const resolvedUserId = await deviceRegistrationService.resolveUserIdByTokenOrDeviceId(token, parsed.data.deviceId)
    if (!resolvedUserId) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized: could not resolve user for device' },
        { status: 401 }
      )
    }

    // Upsert by stable attributes: deviceId is provided by agent; keep it as canonical id
    const deviceRepository = new DeviceRepository(db)
    const apiKey = `cpb_${randomBytes(32).toString('base64url')}`
    const device = await deviceRepository.upsertDevice({
      userId: resolvedUserId,
      deviceId: parsed.data.deviceId,
      name: parsed.data.name,
      platform: parsed.data.platform,
      ipAddress: parsed.data.ipAddress ?? null,
      userAgent: parsed.data.userAgent ?? null,
      apiKey,
      verified: true,
      receiveUpdates: true,
      isActive: true,
    })
    await deviceRepository.verifyDevice(device.deviceId)
    return NextResponse.json({ data: { apiKey, deviceId: device.deviceId, expiresAt: null }, error: null })
  } catch (error) {
    console.error('Error processing device registration:', error)
    
    if (error instanceof Error) {
      // Return specific error messages for known errors
      const status = error.message.includes('Forbidden') ? 403 :
                    error.message.includes('Unauthorized') ? 401 : 400
      
      return NextResponse.json(
        { data: null, error: error.message },
        { status }
      )
    }
    
    return NextResponse.json(
      { data: null, error: 'Failed to process device registration' },
      { status: 500 }
    )
  }
})

export const GET = createRouteHandler({ isPublic: true }, async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { data: null, error: 'Registration token is required' },
        { status: 400 }
      )
    }

    const deviceRegistrationService = createDeviceRegistrationService()
    
    const result = await deviceRegistrationService.completeExistingDeviceRegistration(token)

    return NextResponse.json({
      data: { 
        apiKey: result.apiKey,
        deviceId: result.deviceId,
        expiresAt: null
      },
      error: null
    })
  } catch (error) {
    console.error('Error processing device registration:', error)
    
    if (error instanceof Error) {
      // Return specific error messages for known errors
      const status = error.message.includes('Invalid or expired') ? 400 :
                    error.message.includes('Device not found') ? 404 : 500
      
      return NextResponse.json(
        { data: null, error: error.message },
        { status }
      )
    }
    
    return NextResponse.json(
      { data: null, error: 'Failed to process device registration' },
      { status: 500 }
    )
  }
})