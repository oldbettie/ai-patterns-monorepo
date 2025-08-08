// @feature:allow-list @domain:allow-list @api
// @summary: Main allow list API endpoints for GET and PUT operations

import { createRouteHandler } from '@/lib/auth/route-handler'
import { NextResponse } from 'next/server'
import { createAllowListDependencies } from '@/lib/services/allow-list/allowListService'
import { updateAllowListSchema } from '@/lib/validation/allowListSchemas'

export const GET = createRouteHandler({ isAuthenticated: true }, async req => {
  try {
    const service = createAllowListDependencies(req)
    const allowList = await service.getFamilyAllowList()

    return NextResponse.json({
      data: {
        ...allowList,
        allowedApplications: JSON.parse(allowList.allowedApplications || '[]'),
      },
      error: null,
    })
  } catch (error) {
    console.error('Error getting family allow list:', error)
    return NextResponse.json(
      { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get allow list' 
      },
      { status: 500 }
    )
  }
})

export const PUT = createRouteHandler({ isAuthenticated: true }, async req => {
  try {
    const body = await req.json()
    
    // Validate request body
    const validatedData = updateAllowListSchema.parse(body)

    const service = createAllowListDependencies(req)
    
    // If applications array is provided, update the entire list
    let allowList
    if (validatedData.applications) {
      // This is a complete replacement of the applications list
      const currentList = await service.getFamilyAllowList()
      allowList = await service.performBulkOperation({
        action: 'add',
        applications: validatedData.applications,
      })
      
      // Remove applications that are not in the new list
      const currentApps = JSON.parse(currentList.allowedApplications || '[]') as string[]
      const appsToRemove = currentApps.filter(app => !validatedData.applications!.includes(app))
      
      if (appsToRemove.length > 0) {
        allowList = await service.performBulkOperation({
          action: 'remove',
          applications: appsToRemove,
        })
      }
    } else {
      // Just return the current list if no applications provided
      allowList = await service.getFamilyAllowList()
    }

    return NextResponse.json({
      data: {
        ...allowList,
        allowedApplications: JSON.parse(allowList.allowedApplications || '[]'),
      },
      error: null,
    })
  } catch (error) {
    console.error('Error updating family allow list:', error)
    
    // Handle validation errors
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { data: null, error: 'Invalid request data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update allow list' 
      },
      { status: 500 }
    )
  }
})