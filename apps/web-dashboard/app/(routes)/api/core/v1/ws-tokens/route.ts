import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createWsTokenService } from "@/lib/services/wsTokenService"
import { generateWsTokenSchema } from "@/lib/validation/ws-tokens"

// Generate a token for current user (optionally scoped to a device)
export const POST = createRouteHandler({ isAuthenticated: true }, async (req) => {
  const body = await req.json().catch(() => ({}))
  const parsed = generateWsTokenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 })
  }
  const wsTokenService = createWsTokenService(req)
  const token = await wsTokenService.generate(parsed.data.deviceId)
  return NextResponse.json({ data: token, error: null })
})

