// @feature:device-api-auth @domain:auth @api
// @summary: Route handler for desktop app API key authentication

import { NextRequest, NextResponse } from 'next/server'
import { createDesktopAuthService } from '@/lib/services/desktopAuthService'
import type { Device } from '@auto-paster/database/src/types'

// Extended request type with authenticated device info
export interface DesktopAuthenticatedRequest extends NextRequest {
  device: Device
  user: {
    id: string
  }
}

type DesktopRouteOptions = {
  requireApiKey?: boolean
}

type DesktopRouteHandler = (
  req: DesktopAuthenticatedRequest
) => Promise<NextResponse> | NextResponse

/**
 * Route handler for desktop app API key authentication
 */
export function createDesktopRouteHandler(
  options: DesktopRouteOptions = { requireApiKey: true },
  handler: DesktopRouteHandler
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Extract API key from Authorization header
      const authHeader = req.headers.get('authorization')
      
      if (!authHeader) {
        return NextResponse.json(
          { data: null, error: 'Authorization header required' },
          { status: 401 }
        )
      }

      // Expected format: "Bearer cpb_xxxxx" or "ApiKey cpb_xxxxx"
      const [scheme, apiKey] = authHeader.split(' ')
      
      if (!apiKey || (!scheme.match(/^(Bearer|ApiKey)$/i))) {
        return NextResponse.json(
          { data: null, error: 'Invalid authorization format. Expected: Bearer <api_key>' },
          { status: 401 }
        )
      }

      // Validate API key format
      if (!apiKey.startsWith('cpb_')) {
        return NextResponse.json(
          { data: null, error: 'Invalid API key format' },
          { status: 401 }
        )
      }

      if (options.requireApiKey) {
        // Authenticate device using API key via service
        const authService = createDesktopAuthService()
        const device = await authService.authenticateByApiKey(apiKey)
        
        if (!device) {
          return NextResponse.json(
            { data: null, error: 'Invalid or expired API key' },
            { status: 401 }
          )
        }

        if (!device.verified) {
          return NextResponse.json(
            { data: null, error: 'Device not verified. Please verify device through dashboard.' },
            { status: 403 }
          )
        }

        // Create authenticated request object
        const authenticatedReq = req as DesktopAuthenticatedRequest
        authenticatedReq.device = device
        authenticatedReq.user = { id: device.userId }

        return await handler(authenticatedReq)
      } else {
        // For routes that don't require authentication, pass through
        const authenticatedReq = req as DesktopAuthenticatedRequest
        return await handler(authenticatedReq)
      }
    } catch (error) {
      console.error('Desktop route handler error:', error)
      return NextResponse.json(
        { data: null, error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware helper to extract device info from API key (for debugging)
 */
export async function getDeviceFromApiKey(apiKey: string): Promise<Device | null> {
  try {
    const authService = createDesktopAuthService()
    return await authService.authenticateByApiKey(apiKey)
  } catch (error) {
    console.error('Failed to get device from API key:', error)
    return null
  }
}

/**
 * Helper to validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.startsWith('cpb_') && apiKey.length > 10
}

/**
 * Rate limiting configuration for desktop apps
 */
export const DESKTOP_RATE_LIMITS = {
  // Allow 300 requests per hour (5 second polling interval)
  requestsPerHour: 300,
  // Burst allowance for initial sync
  burstAllowance: 50,
  // Window in milliseconds
  windowMs: 60 * 60 * 1000, // 1 hour
} as const