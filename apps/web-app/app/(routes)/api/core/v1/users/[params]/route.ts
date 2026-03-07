import { createRouteHandler } from '@/lib/auth/route-handler'
import { NextResponse } from 'next/server'
import { updateUserSettingsSchema, createUserService } from '@/lib/services/userService'

export const PATCH = createRouteHandler(
  { isAuthenticated: true },
  async (req, { params }: { params: Promise<{ params: string }> }) => {
    try {
      const { params: userId } = await params
      const body = await req.json()
      const validatedData = updateUserSettingsSchema.parse(body)

      const userService = createUserService(req)
      const updatedUser = await userService.updateUserSettings(userId, validatedData)

      return NextResponse.json({
        data: {
          success: true,
          user: updatedUser,
        },
        error: null,
      })
    } catch (error: any) {
      console.error('PATCH /api/core/v1/users/[params] error:', error)

      if (error.name === 'ZodError') {
        return NextResponse.json(
          { data: null, error: 'Invalid request data', details: error.errors },
          { status: 400 }
        )
      }

      if (error.message === 'Email already in use') {
        return NextResponse.json({ data: null, error: error.message }, { status: 409 })
      }

      if (error.message === 'User not found') {
        return NextResponse.json({ data: null, error: error.message }, { status: 404 })
      }

      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ data: null, error: error.message }, { status: 403 })
      }

      return NextResponse.json(
        { data: null, error: 'Failed to update user settings' },
        { status: 500 }
      )
    }
  }
)
