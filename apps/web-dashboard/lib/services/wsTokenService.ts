import "server-only"

import { WsTokenRepository } from "@auto-paster/database/src/repositories/wsTokenRepository"
import { db } from "@auto-paster/database/src/database"
import { ServiceContext } from "@/lib/types"

export class WsTokenService {
  private readonly wsTokenRepository: WsTokenRepository
  private readonly context: ServiceContext

  constructor(
    wsTokenRepository: WsTokenRepository,
    context: ServiceContext
  ) {
    this.wsTokenRepository = wsTokenRepository
    this.context = context
  }

  async generate(deviceId?: string) {
    return this.wsTokenRepository.generateToken(this.context.user.id, deviceId)
  }

  async validate(token: string) {
    return this.wsTokenRepository.validateToken(token)
  }

  async refresh(token: string) {
    return this.wsTokenRepository.refreshToken(token)
  }

  async revoke(token: string) {
    await this.wsTokenRepository.deleteToken(token)
  }

  async revokeAllForUser() {
    await this.wsTokenRepository.deleteUserTokens(this.context.user.id)
  }
}

export const createWsTokenService = (req: ServiceContext ) => {
  const wsTokenRepository = new WsTokenRepository(db)
  
  return new WsTokenService(wsTokenRepository, req)
}


