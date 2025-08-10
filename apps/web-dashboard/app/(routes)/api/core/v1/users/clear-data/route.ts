import { createRouteHandler } from "@/lib/auth/route-handler"
import { NextResponse } from "next/server"
import { createUserService } from "@/lib/services/userService"

// Get data summary for the authenticated user
export const GET = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  try {
    const userService = createUserService(req)
    const summary = await userService.getUserDataSummary()
    
    if (!summary) {
      return NextResponse.json({ data: null, error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({ data: summary, error: null })
  } catch (error) {
    console.error("Error getting user data summary:", error)
    return NextResponse.json(
      { data: null, error: "Failed to get user data summary" },
      { status: 500 }
    )
  }
})

// Clear ALL user data (destructive operation)
export const DELETE = createRouteHandler({ isAuthenticated: true }, async (req, ctx) => {
  try {
    const userService = createUserService(req)
    
    // Get summary before deletion for response
    const summary = await userService.getUserDataSummary()
    
    // Delete all user data (this will cascade delete everything)
    await userService.deleteAllUserData()
    
    return NextResponse.json({ 
      data: { 
        message: "All user data successfully deleted",
        previousDataSummary: summary
      }, 
      error: null 
    })
  } catch (error) {
    console.error("Error clearing all user data:", error)
    return NextResponse.json(
      { data: null, error: "Failed to clear all user data" },
      { status: 500 }
    )
  }
})