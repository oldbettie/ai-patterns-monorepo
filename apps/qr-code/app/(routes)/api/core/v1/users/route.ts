import { createRouteHandler } from '@/lib/auth/route-handler'
import { NextResponse } from 'next/server'
import { updateUserSettingsSchema, createUserService } from '@/lib/services/userService'

export const GET = createRouteHandler({ isAuthenticated: true }, async req => {
  // The authenticated user sent via secureFetch()
  const user = req.user
  const session = req.session

  return NextResponse.json({
    data: {
      user: user,
    },
    error: null,
  })
})

export const PATCH = createRouteHandler(
  { isAuthenticated: true },
  async req => {
    try {
      const body = await req.json()
      const validatedData = updateUserSettingsSchema.parse(body)

      const userService = createUserService(req)
      const updatedUser = await userService.updateUserSettings(
        req.user.id,
        validatedData
      )

      return NextResponse.json({
        data: {
          success: true,
          user: updatedUser,
        },
        error: null,
      })
    } catch (error: any) {
      console.error('PATCH /api/core/v1/users error:', error)

      // Handle validation errors
      if (error.name === 'ZodError') {
        return NextResponse.json(
          {
            data: null,
            error: 'Invalid request data',
            details: error.errors,
          },
          { status: 400 }
        )
      }

      // Handle business logic errors
      if (error.message === 'Email already in use') {
        return NextResponse.json(
          {
            data: null,
            error: error.message,
          },
          { status: 409 }
        )
      }

      if (error.message === 'User not found') {
        return NextResponse.json(
          {
            data: null,
            error: error.message,
          },
          { status: 404 }
        )
      }

      // Handle unauthorized errors
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          {
            data: null,
            error: error.message,
          },
          { status: 403 }
        )
      }

      // Generic error
      return NextResponse.json(
        {
          data: null,
          error: 'Failed to update user settings',
        },
        { status: 500 }
      )
    }
  }
)
