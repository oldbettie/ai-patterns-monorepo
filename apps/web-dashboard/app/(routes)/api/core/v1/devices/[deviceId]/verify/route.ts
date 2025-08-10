// @feature:device-management @domain:devices @api
// @summary: Device verification endpoint for confirming device ownership

import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createDeviceService } from "@/lib/services/deviceService"

// Verify device ownership
export const POST = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  const { deviceId } = await ctx.params

  try {
    const deviceService = createDeviceService(req)
    const verified = await deviceService.verifyDevice(deviceId as string)
    if (!verified) {
      return NextResponse.json({ data: null, error: "Device not found" }, { status: 404 })
    }
    
    return NextResponse.json({ data: verified, error: null })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 })
  }
})

// Generate verification token for device
export const GET = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  const { deviceId } = await ctx.params

  try {
    const deviceService = createDeviceService(req)
    const token = await deviceService.generateVerificationToken(deviceId as string)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
    const verificationUrl = `${baseUrl}/verify-device?token=${token}&deviceId=${deviceId}`
    
    return NextResponse.json({ data: { token, verificationUrl }, error: null })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 })
  }
})