// @feature:allow-list @domain:allow-list @api
// @summary: Preset modes API endpoints for managing preset allow list modes

import { createRouteHandler } from '@/lib/auth/route-handler'
import { NextResponse } from 'next/server'
import { createAllowListDependencies } from '@/lib/services/allow-list/allowListService'
import { applyPresetModeSchema } from '@/lib/validation/allowListSchemas'

export const GET = createRouteHandler({ isAuthenticated: true }, async req => {
  try {
    const service = createAllowListDependencies(req)
    const presets = await service.getAvailablePresetModes()

    // Parse applications JSON for each preset for easier frontend consumption
    const presetsWithParsedApps = presets.map(preset => ({
      ...preset,
      applications: JSON.parse(preset.applications || '[]'),
    }))

    return NextResponse.json({
      data: presetsWithParsedApps,
      error: null,
    })
  } catch (error) {
    console.error('Error getting preset modes:', error)
    return NextResponse.json(
      { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get preset modes' 
      },
      { status: 500 }
    )
  }
})

export const POST = createRouteHandler({ isAuthenticated: true }, async req => {
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = applyPresetModeSchema.parse(body)

    const service = createAllowListDependencies(req)
    const allowList = await service.applyPresetMode(validatedData.mode)

    return NextResponse.json({
      data: {
        ...allowList,
        allowedApplications: JSON.parse(allowList.allowedApplications || '[]'),
      },
      error: null,
    })
  } catch (error) {
    console.error('Error applying preset mode:', error)
    
    // Handle validation errors
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { data: null, error: 'Invalid preset mode' },
        { status: 400 }
      )
    }

    // Handle service errors (preset not found, inactive, etc.)
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes('not active')) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to apply preset mode' 
      },
      { status: 500 }
    )
  }
})