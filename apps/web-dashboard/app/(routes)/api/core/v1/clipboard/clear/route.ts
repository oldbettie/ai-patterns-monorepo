import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createClipboardService } from "@/lib/services/clipboardService"

// Clear all clipboard items for the authenticated user
export const DELETE = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  try {
    const clipboardService = createClipboardService(req)
    const deletedCount = await clipboardService.deleteAllUserItems()
    
    return NextResponse.json({ 
      data: { 
        deletedCount,
        message: `Successfully deleted ${deletedCount} clipboard items`
      }, 
      error: null 
    })
  } catch (error) {
    console.error("Error clearing clipboard items:", error)
    return NextResponse.json(
      { data: null, error: "Failed to clear clipboard items" },
      { status: 500 }
    )
  }
})