import { createRouteHandler } from '@/lib/auth/route-handler'
import { createDesktopRouteHandler } from '@/lib/auth/desktop-route-handler'
import { NextResponse } from 'next/server'

// Desktop app endpoint (using API key authentication)
export const GET = createDesktopRouteHandler({ requireApiKey: true }, async req => {
  return NextResponse.json({
    data: {
      user: req.user,
    },
    error: null,
  })
})

export const PATCH = createRouteHandler({ isAuthenticated: true }, async () => {
  // const body = await req.json()

  // Your update logic here
  // Example: update user profile

  return NextResponse.json({
    data: { message: 'User updated successfully' },
    error: null,
  })
})
