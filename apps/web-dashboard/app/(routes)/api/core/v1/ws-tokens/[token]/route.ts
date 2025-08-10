import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createWsTokenService } from "@/lib/services/wsTokenService"

// Validate token (for diagnostics)
export const GET = createRouteHandler({ isPublic: true }, async (_req, ctx) => {
  const { token } = await ctx.params
  const wsTokenService = createWsTokenService({ user: { id: "public" } } as any)
  const result = await wsTokenService.validate(token as string)
  if (!result) {
    return NextResponse.json({ data: null, error: "Invalid or expired token" }, { status: 404 })
  }
  return NextResponse.json({ data: { userId: result.userId, deviceId: result.deviceId, expiresAt: result.expiresAt }, error: null })
})

// Revoke token
export const DELETE = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  const { token } = await ctx.params
  const wsTokenService = createWsTokenService(req)
  await wsTokenService.revoke(token as string)
  return NextResponse.json({ data: { ok: true }, error: null })
})

