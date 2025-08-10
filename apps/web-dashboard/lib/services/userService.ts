import "server-only"

import { UserRepository } from "@auto-paster/database/src/repositories/userRepository"
import { db } from "@auto-paster/database/src/database"
import { ServiceContext } from "@/lib/types"

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
    // This will cascade delete all associated data due to foreign key constraints:
    // - All user's devices
    // - All user's clipboard items
    // - All user's websocket tokens
    // - All user's pending device registrations
    // - All user's sessions
    // - All user's accounts
    await this.userRepository.deleteUser(this.context.user.id)
  }
}

export const createUserService = (req: ServiceContext) => {
  const userRepository = new UserRepository(db)
  
  return new UserService(userRepository, req)
}