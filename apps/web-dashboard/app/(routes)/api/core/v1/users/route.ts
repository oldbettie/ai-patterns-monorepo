import { createRouteHandler } from '@/lib/auth/route-handler'
import { NextResponse } from 'next/server'

export const GET = createRouteHandler({ isAuthenticated: true }, async req => {
  return NextResponse.json({
    data: {
      user: req.user,
      session: req.session,
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
