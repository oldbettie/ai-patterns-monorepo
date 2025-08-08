// @feature:allow-list @domain:allow-list @api
// @summary: Individual application management endpoints for allow list

import { createRouteHandler } from '@/lib/auth/route-handler'
import { NextResponse } from 'next/server'
import { createAllowListDependencies } from '@/lib/services/allow-list/allowListService'
import { singleApplicationSchema } from '@/lib/validation/allowListSchemas'

export const POST = createRouteHandler({ isAuthenticated: true }, async req => {
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = singleApplicationSchema.parse(body)

    const service = createAllowListDependencies(req)
    const allowList = await service.addSingleApplication(validatedData.application)

    return NextResponse.json({
      data: {
        ...allowList,
        allowedApplications: JSON.parse(allowList.allowedApplications || '[]'),
      },
      error: null,
    })
  } catch (error) {
    console.error('Error adding application:', error)
    
    // Handle validation errors
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { data: null, error: 'Invalid application name' },
        { status: 400 }
      )
    }

    // Handle service validation errors
    if (error instanceof Error && (
      error.message.includes('cannot be empty') || 
      error.message.includes('cannot exceed')
    )) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to add application' 
      },
      { status: 500 }
    )
  }
})

export const DELETE = createRouteHandler({ isAuthenticated: true }, async req => {
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = singleApplicationSchema.parse(body)

    const service = createAllowListDependencies(req)
    const allowList = await service.removeSingleApplication(validatedData.application)

    return NextResponse.json({
      data: {
        ...allowList,
        allowedApplications: JSON.parse(allowList.allowedApplications || '[]'),
      },
      error: null,
    })
  } catch (error) {
    console.error('Error removing application:', error)
    
    // Handle validation errors
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { data: null, error: 'Invalid application name' },
        { status: 400 }
      )
    }

    // Handle service validation errors
    if (error instanceof Error && (
      error.message.includes('cannot be empty') || 
      error.message.includes('cannot exceed')
    )) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to remove application' 
      },
      { status: 500 }
    )
  }
})