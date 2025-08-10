import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createDeviceService } from "@/lib/services/deviceService"
import { registerDeviceSchema, manualAddDeviceSchema } from "@/lib/validation/devices"

// List devices for current user
export const GET = createRouteHandler({ isAuthenticated: true }, async (req) => {
  const deviceService = createDeviceService(req)
  const devices = await deviceService.listUserDevices()
  return NextResponse.json({ data: devices, error: null })
})

// Register/update device for current user
export const POST = createRouteHandler({ isAuthenticated: true }, async (req) => {
  const body = await req.json()
  
  // Check if this is a manual device registration
  if (body.isManual) {
    const parsed = manualAddDeviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 })
    }

    // Generate a device ID for manual devices
    const deviceId = `manual_${req.user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    const deviceService = createDeviceService(req)
    const device = await deviceService.registerOrUpdateDevice({
      deviceId,
      name: parsed.data.name,
      platform: parsed.data.platform || 'linux',
      ipAddress: parsed.data.ipAddress,
      userAgent: null,
    })

    return NextResponse.json({ data: device, error: null })
  }

  // Standard device registration
  const parsed = registerDeviceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 })
  }

  const deviceService = createDeviceService(req)
  const device = await deviceService.registerOrUpdateDevice(parsed.data)

  return NextResponse.json({ data: device, error: null })
})

