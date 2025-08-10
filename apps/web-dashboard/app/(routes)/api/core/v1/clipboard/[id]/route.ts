import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createClipboardService } from "@/lib/services/clipboardService"

// Get item by id
export const GET = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  const { id } = await ctx.params
  const clipboardService = createClipboardService(req)
  const item = await clipboardService.getItemById(id as string)
  if (!item) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 })
  }
  return NextResponse.json({ data: item, error: null })
})

// Delete item
export const DELETE = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  const { id } = await ctx.params
  const clipboardService = createClipboardService(req)
  await clipboardService.deleteItem(id as string)
  return NextResponse.json({ data: { ok: true }, error: null })
})

