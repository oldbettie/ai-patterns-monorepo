import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createClipboardService } from "@/lib/services/clipboardService"
import { createClipboardItemSchema, getSinceSchema } from "@/lib/validation/clipboard"

// Get recent clipboard items or since a sequence number
export const GET = createRouteHandler({ isAuthenticated: true }, async (req) => {
  const { searchParams } = new URL(req.url)
  const parsed = getSinceSchema.safeParse({
    since: searchParams.get("since") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 })
  }

  const { since, limit } = parsed.data
  const clipboardService = createClipboardService(req)
  const data = since > 0
    ? await clipboardService.getItemsSince(since, limit)
    : await clipboardService.getRecentItems(limit)

  return NextResponse.json({ data, error: null })
})

// Create new clipboard item
export const POST = createRouteHandler({ isAuthenticated: true }, async (req) => {
  const body = await req.json()
  const parsed = createClipboardItemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.flatten() }, { status: 400 })
  }

  const clipboardService = createClipboardService(req)
  const item = await clipboardService.createClipboardItem(parsed.data)
  return NextResponse.json({ data: item, error: null })
})

