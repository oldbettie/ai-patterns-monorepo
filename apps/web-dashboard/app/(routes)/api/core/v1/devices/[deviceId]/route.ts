import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createDeviceService } from "@/lib/services/deviceService"
import { renameDeviceSchema, toggleUpdatesSchema } from "@/lib/validation/devices"

// Update device (rename, toggle updates, etc.)
export const PATCH = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  const { deviceId } = await ctx.params
  const body = await req.json()
  
  // Check if this is a rename request
  if ('name' in body) {
    const parsed = renameDeviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 })
    }

    const deviceService = createDeviceService(req)
    const updated = await deviceService.renameDevice(deviceId as string, parsed.data.name)
    if (!updated) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ data: updated, error: null })
  }
  
  // Check if this is a toggle updates request
  if ('receiveUpdates' in body) {
    const parsed = toggleUpdatesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 })
    }

    const deviceService = createDeviceService(req)
    const updated = await deviceService.toggleDeviceUpdates(deviceId as string, parsed.data.receiveUpdates)
    if (!updated) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ data: updated, error: null })
  }

  return NextResponse.json({ data: null, error: "Invalid request" }, { status: 400 })
})

// Delete device
export const DELETE = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  const { deviceId } = await ctx.params
  const deviceService = createDeviceService(req)
  try {
    await deviceService.deleteDevice(deviceId as string)
    return NextResponse.json({ data: { ok: true }, error: null })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Forbidden")) {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 })
  }
})

