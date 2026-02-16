import type { DependencyContainer } from '@/lib/injector/dependencies'
import type { ClientMessageRow } from '../types'
import type { UUID } from '../types/postgres'

export class ChatRepository {
  constructor(private ctx: DependencyContainer) {}

  async listClientMessages(userId: UUID): Promise<Omit<ClientMessageRow, 'user_id'>[]> {
    const now = Date.now()
    const messages = await this.ctx.db.sql<Omit<ClientMessageRow, 'user_id'>>`
      SELECT id, "role", content, "date"
      FROM client_chat_message_view
      WHERE user_id = ${userId}
      ORDER BY id DESC
    `
    console.debug(
      `Fetched ${messages.length} chat messages for user ${userId} in ${Date.now() - now}ms`,
    )

    return messages
  }
}
