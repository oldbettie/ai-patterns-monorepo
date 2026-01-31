import "server-only"

import { UserRepository } from "@better-stack-monorepo/database/src/repositories/userRepository"
import { db } from "@better-stack-monorepo/database/src/database"
import { ServiceContext } from "@/lib/types"
import { z } from "zod"

// Validation schema for user settings update
export const updateUserSettingsSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional().nullable(),
})

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>

export class UserService {
  private readonly userRepository: UserRepository
  private readonly context: ServiceContext

  constructor(
    userRepository: UserRepository,
    context: ServiceContext
  ) {
    this.userRepository = userRepository
    this.context = context
  }

  async getUserDataSummary() {
    return this.userRepository.getUserDataSummary(this.context.user.id)
  }

  async deleteAllUserData() {
    // This will cascade delete all associated data due to foreign key constraints
    await this.userRepository.deleteUser(this.context.user.id)
  }

  async updateUserSettings(userId: string, data: UpdateUserSettingsInput) {
    // Ensure user can only update their own data
    if (userId !== this.context.user.id) {
      throw new Error('Unauthorized: Cannot update another user\'s settings')
    }

    // If email is being updated, check if it's already taken
    if (data.email && data.email !== this.context.user.email) {
      const existingUser = await this.userRepository.getUserByEmail(data.email)
      if (existingUser) {
        throw new Error('Email already in use')
      }
    }

    const updatedUser = await this.userRepository.updateUser(userId, {
      name: data.name,
      email: data.email,
      image: data.image ?? undefined,
    })

    if (!updatedUser) {
      throw new Error('User not found')
    }

    return updatedUser
  }
}

export const createUserService = (req: ServiceContext) => {
  const userRepository = new UserRepository(db)

  return new UserService(userRepository, req)
}
