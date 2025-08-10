// @feature:websocket-auth @domain:database @backend
// @summary: Repository for WebSocket authentication token management

import type { DB } from '../database'
import { wsTokens } from '../schemas'
import type { WsToken, NewWsToken } from '../types'
import { eq, lt, gt, and } from 'drizzle-orm'
import { randomBytes } from 'crypto'

// Token expiry configuration
const TOKEN_EXPIRY_MINUTES = 15 // WebSocket tokens expire after 15 minutes

export class WsTokenRepository {
  constructor(private readonly db: DB) {}
  /**
   * Generate a new WebSocket token for a user/device
   */
  async generateToken(userId: string, deviceId?: string): Promise<WsToken> {
    // Generate cryptographically secure random token
    const tokenBytes = randomBytes(32)
    const token = tokenBytes.toString('base64url')

    // Set expiry time
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + TOKEN_EXPIRY_MINUTES)

    const tokenData: NewWsToken = {
      token,
      userId,
      deviceId: deviceId || null,
      expiresAt,
    }

    const [newToken] = await this.db
      .insert(wsTokens)
      .values(tokenData)
      .returning()

    return newToken
  }

  /**
   * Validate and get token information
   */
  async validateToken(token: string): Promise<WsToken | null> {
    const result = await this.db
      .select()
      .from(wsTokens)
      .where(eq(wsTokens.token, token))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    const wsToken = result[0]

    // Check if token is expired
    if (wsToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.deleteToken(token)
      return null
    }

    return wsToken
  }

  /**
   * Get all active tokens for a user
   */
  async getUserTokens(userId: string): Promise<WsToken[]> {
    const now = new Date()
    
    return this.db
      .select()
      .from(wsTokens)
      .where(
        and(
          eq(wsTokens.userId, userId),
          gt(wsTokens.expiresAt, now) // Only return non-expired tokens
        )
      )
  }

  /**
   * Get active tokens for a specific device
   */
  async getDeviceTokens(deviceId: string): Promise<WsToken[]> {
    const now = new Date()
    
    return this.db
      .select()
      .from(wsTokens)
      .where(
        and(
          eq(wsTokens.deviceId, deviceId),
          gt(wsTokens.expiresAt, now) // Only return non-expired tokens
        )
      )
  }

  /**
   * Delete a specific token (logout)
   */
  async deleteToken(token: string): Promise<void> {
    await this.db
      .delete(wsTokens)
      .where(eq(wsTokens.token, token))
  }

  /**
   * Delete all tokens for a user (logout all devices)
   */
  async deleteUserTokens(userId: string): Promise<void> {
    await this.db
      .delete(wsTokens)
      .where(eq(wsTokens.userId, userId))
  }

  /**
   * Delete all tokens for a device
   */
  async deleteDeviceTokens(deviceId: string): Promise<void> {
    await this.db
      .delete(wsTokens)
      .where(eq(wsTokens.deviceId, deviceId))
  }

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date()
    
    const deletedTokens = await this.db
      .delete(wsTokens)
      .where(lt(wsTokens.expiresAt, now))
      .returning({ token: wsTokens.token })

    return deletedTokens.length
  }

  /**
   * Get token count for a user (for rate limiting)
   */
  async getUserTokenCount(userId: string): Promise<number> {
    const now = new Date()
    
    const result = await this.db
      .select({ count: wsTokens.token })
      .from(wsTokens)
      .where(
        and(
          eq(wsTokens.userId, userId),
          gt(wsTokens.expiresAt, now)
        )
      )

    return result.length
  }

  /**
   * Refresh token (extend expiry time)
   */
  async refreshToken(token: string): Promise<WsToken | null> {
    // First validate the token exists and is not expired
    const existingToken = await this.validateToken(token)
    if (!existingToken) {
      return null
    }

    // Extend expiry time
    const newExpiresAt = new Date()
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + TOKEN_EXPIRY_MINUTES)

    const [refreshedToken] = await this.db
      .update(wsTokens)
      .set({ expiresAt: newExpiresAt })
      .where(eq(wsTokens.token, token))
      .returning()

    return refreshedToken || null
  }

  /**
   * Check if user has reached token limit (for rate limiting)
   */
  async isTokenLimitExceeded(userId: string, maxTokens: number = 10): Promise<boolean> {
    const tokenCount = await this.getUserTokenCount(userId)
    return tokenCount >= maxTokens
  }

  /**
   * Generate token with custom expiry (for special use cases)
   */
  async generateTokenWithExpiry(userId: string, expiryMinutes: number, deviceId?: string): Promise<WsToken> {
    // Generate cryptographically secure random token
    const tokenBytes = randomBytes(32)
    const token = tokenBytes.toString('base64url')

    // Set custom expiry time
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes)

    const tokenData: NewWsToken = {
      token,
      userId,
      deviceId: deviceId || null,
      expiresAt,
    }

    const [newToken] = await this.db
      .insert(wsTokens)
      .values(tokenData)
      .returning()

    return newToken
  }
}