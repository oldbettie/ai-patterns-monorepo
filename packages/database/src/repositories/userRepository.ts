// @feature:user-repository @domain:database @backend
// @summary: User repository for user data management and deletion

import "server-only"

import { db, type DB } from "../database"
import { user, devices, clipboardItems, wsTokens, pendingDeviceRegistrations } from "../schemas"
import { eq } from "drizzle-orm"

export class UserRepository {
  constructor(private readonly db: DB) {}

  /**
   * Delete a user and all associated data
   * This will cascade delete all associated records due to foreign key constraints
   */
  async deleteUser(userId: string): Promise<void> {
    // Due to cascade constraints, deleting the user will automatically delete:
    // - devices (which cascades to delete clipboardItems and wsTokens)
    // - clipboardItems
    // - wsTokens
    // - pendingDeviceRegistrations
    // - sessions
    // - accounts
    await this.db.delete(user).where(eq(user.id, userId))
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const result = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    return result[0] || null
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const result = await this.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    return result[0] || null
  }

  /**
   * Get data summary for a user (for debugging deletion issues)
   */
  async getUserDataSummary(userId: string) {
    const [userRecord] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)

    if (!userRecord) {
      return null
    }

    const [deviceCount] = await this.db
      .select({ count: devices.id })
      .from(devices)
      .where(eq(devices.userId, userId))

    const [clipboardCount] = await this.db
      .select({ count: clipboardItems.id })
      .from(clipboardItems)
      .where(eq(clipboardItems.userId, userId))

    const [wsTokenCount] = await this.db
      .select({ count: wsTokens.token })
      .from(wsTokens)
      .where(eq(wsTokens.userId, userId))

    const [pendingCount] = await this.db
      .select({ count: pendingDeviceRegistrations.token })
      .from(pendingDeviceRegistrations)
      .where(eq(pendingDeviceRegistrations.userId, userId))

    return {
      user: userRecord,
      deviceCount: deviceCount ? 1 : 0,
      clipboardItemCount: clipboardCount ? 1 : 0,
      wsTokenCount: wsTokenCount ? 1 : 0,
      pendingRegistrationCount: pendingCount ? 1 : 0,
    }
  }
}

// Factory function for creating UserRepository instances
export function createUserRepository(database: DB = db): UserRepository {
  return new UserRepository(database)
}