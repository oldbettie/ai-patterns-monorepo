// @feature:allow-list @domain:allow-list @api
// @summary: Bulk operations endpoint for managing multiple applications at once

import { createRouteHandler } from '@/lib/auth/route-handler'
import { NextResponse } from 'next/server'
import { createAllowListDependencies } from '@/lib/services/allow-list/allowListService'
import { bulkOperationSchema } from '@/lib/validation/allowListSchemas'

export const POST = createRouteHandler({ isAuthenticated: true }, async req => {
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = bulkOperationSchema.parse(body)

    const service = createAllowListDependencies(req)
    const allowList = await service.performBulkOperation({
      action: validatedData.action,
      applications: validatedData.applications,
    })

    return NextResponse.json({
      data: {
        ...allowList,
        allowedApplications: JSON.parse(allowList.allowedApplications || '[]'),
        operationSummary: {
          action: validatedData.action,
          applicationsProcessed: validatedData.applications.length,
          newVersion: allowList.listVersion,
        },
      },
      error: null,
    })
  } catch (error) {
    console.error('Error performing bulk operation:', error)
    
    // Handle validation errors
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { data: null, error: 'Invalid bulk operation request' },
        { status: 400 }
      )
    }

    // Handle service validation errors
    if (error instanceof Error && (
      error.message.includes('Applications array cannot be empty') ||
      error.message.includes('Action must be either') ||
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
        error: error instanceof Error ? error.message : 'Failed to perform bulk operation' 
      },
      { status: 500 }
    )
  }
})