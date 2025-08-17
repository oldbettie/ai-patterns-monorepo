// @feature:user-repository @domain:database @backend
// @summary: User repository for user data management and deletion

import "server-only"

import { db, type DB } from "../database"
import { user } from "../schemas"
import { eq } from "drizzle-orm"

export class UserRepository {
  constructor(private readonly db: DB) {}

  /**
   * Delete a user and all associated data
   * This will cascade delete all associated records due to foreign key constraints
   */
  async deleteUser(userId: string): Promise<void> {
    // Due to cascade constraints, deleting the user will automatically delete:
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

    return {
      user: userRecord,
    }
  }
}

// Factory function for creating UserRepository instances
export function createUserRepository(database: DB = db): UserRepository {
  return new UserRepository(database)
}