// @feature:device-api-auth @domain:devices @api
// @summary: API endpoint for device authentication and API key generation

import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { DeviceRepository } from "@auto-paster/database/src/repositories/deviceRepository"
import { db } from "@auto-paster/database/src/database"

/**
 * Generate API key for authenticated device
 * POST /api/core/v1/devices/auth
 * 
 * Body: { deviceId: string }
 * Returns: { data: { apiKey: string }, error: null }
 */
export const POST = createRouteHandler({ isAuthenticated: true }, async (req) => {
  try {
    const body = await req.json()
    const { deviceId } = body

    if (!deviceId || typeof deviceId !== 'string') {
      return NextResponse.json(
        { data: null, error: 'Device ID is required' },
        { status: 400 }
      )
    }

    const deviceRepository = new DeviceRepository(db)
    
    // Verify device belongs to authenticated user
    const isUserDevice = await deviceRepository.isUserDevice(req.user.id, deviceId)
    if (!isUserDevice) {
      return NextResponse.json(
        { data: null, error: 'Device not found or does not belong to user' },
        { status: 404 }
      )
    }

    // Get device to check if it's verified
    const device = await deviceRepository.getDeviceByDeviceId(deviceId)
    if (!device) {
      return NextResponse.json(
        { data: null, error: 'Device not found' },
        { status: 404 }
      )
    }

    if (!device.verified) {
      return NextResponse.json(
        { data: null, error: 'Device must be verified before generating API key' },
        { status: 403 }
      )
    }

    // Generate API key
    const apiKey = await deviceRepository.generateApiKey(deviceId)

    return NextResponse.json({
      data: { 
        apiKey,
        deviceId,
        expiresAt: null // API keys don't expire (can be revoked)
      },
      error: null
    })
  } catch (error) {
    console.error('Error generating device API key:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to generate API key' },
      { status: 500 }
    )
  }
})

/**
 * Revoke API key for authenticated device
 * DELETE /api/core/v1/devices/auth
 * 
 * Body: { deviceId: string }
 * Returns: { data: { success: true }, error: null }
 */
export const DELETE = createRouteHandler({ isAuthenticated: true }, async (req) => {
  try {
    const body = await req.json()
    const { deviceId } = body

    if (!deviceId || typeof deviceId !== 'string') {
      return NextResponse.json(
        { data: null, error: 'Device ID is required' },
        { status: 400 }
      )
    }

    const deviceRepository = new DeviceRepository(db)
    
    // Verify device belongs to authenticated user
    const isUserDevice = await deviceRepository.isUserDevice(req.user.id, deviceId)
    if (!isUserDevice) {
      return NextResponse.json(
        { data: null, error: 'Device not found or does not belong to user' },
        { status: 404 }
      )
    }

    // Revoke API key
    await deviceRepository.revokeApiKey(deviceId)

    return NextResponse.json({
      data: { success: true },
      error: null
    })
  } catch (error) {
    console.error('Error revoking device API key:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to revoke API key' },
      { status: 500 }
    )
  }
})

/**
 * Check API key status for authenticated device
 * GET /api/core/v1/devices/auth?deviceId=xxx
 * 
 * Returns: { data: { hasApiKey: boolean, deviceId: string }, error: null }
 */
export const GET = createRouteHandler({ isAuthenticated: true }, async (req) => {
  try {
    const { searchParams } = new URL(req.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json(
        { data: null, error: 'Device ID is required' },
        { status: 400 }
      )
    }

    const deviceRepository = new DeviceRepository(db)
    
    // Verify device belongs to authenticated user
    const isUserDevice = await deviceRepository.isUserDevice(req.user.id, deviceId)
    if (!isUserDevice) {
      return NextResponse.json(
        { data: null, error: 'Device not found or does not belong to user' },
        { status: 404 }
      )
    }

    // Check if device has API key
    const hasApiKey = await deviceRepository.hasApiKey(deviceId)

    return NextResponse.json({
      data: { 
        hasApiKey,
        deviceId
      },
      error: null
    })
  } catch (error) {
    console.error('Error checking device API key status:', error)
    return NextResponse.json(
      { data: null, error: 'Failed to check API key status' },
      { status: 500 }
    )
  }
})