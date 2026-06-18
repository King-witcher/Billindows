import { SELECT } from 'pg-chain'
import { uuidv7 } from 'uuidv7'
import type { DefaultContainer } from '@/lib/injector/dependencies'
import type { IDBClient } from '../db'
import type { ClientMessageRow } from '../types'
import type { LLMChatMessageRow } from '../types/llm-message-row'
import type { UUID } from '../types/postgres'

export type ListClientMessagesQuery = {
  limit?: number
  before?: {
    id: UUID
  } | null
}

export class ChatRepository {
  constructor(private ctx: DefaultContainer) {}

  async listClientMessages(
    conversationId: UUID,
    { limit = 10, before = null }: ListClientMessagesQuery = {},
  ): Promise<Omit<ClientMessageRow, 'user_id'>[]> {
    const query = SELECT`id, "role", content, "date"` //
      .FROM`client_chat_message_view` //
      .WHERE`user_id = ${conversationId}` //
      .if(before !== null, (q) => q.AND`id < ${before?.id}`) //
      .ORDER_BY`id DESC` //
      .LIMIT`${limit}`

    const now = Date.now()
    const messages = await this.ctx.db.query<Omit<ClientMessageRow, 'user_id'>>(query)

    console.debug(
      `Fetched ${messages.length} client chat messages for user ${conversationId} in ${Date.now() - now}ms`,
    )

    return messages
  }

  async listLLMessages(
    conversationId: UUID,
    limit: number = 10,
  ): Promise<Omit<LLMChatMessageRow, 'user_id'>[]> {
    const now = Date.now()
    const messages = await this.ctx.db.sql<Omit<LLMChatMessageRow, 'user_id'>>`
      SELECT id, "role", content, "function_calls"
      FROM llm_chat_message_view
      WHERE user_id = ${conversationId}
      ORDER BY id DESC
      LIMIT ${limit}
    `
    console.debug(
      `Fetched ${messages.length} LLM chat messages for user ${conversationId} in ${Date.now() - now}ms`,
    )
    return messages
  }

  async createClientMessage(
    message: Omit<ClientMessageRow, 'id' | 'date' | 'role'>,
    dbClient?: IDBClient,
  ) {
    const db = dbClient ?? this.ctx.db
    const id = uuidv7()

    const now = Date.now()
    await db.sql<Omit<ClientMessageRow, 'id' | 'date'>>`
      INSERT INTO chat_message (id, user_id, "role", content)
      VALUES (${id}, ${message.user_id}, 'user', ${message.content})
    `
    console.debug(`Created chat message for user ${message.user_id} in ${Date.now() - now}ms`)
  }

  async createLLMMessages(
    conversationId: UUID,
    ...messages: Omit<LLMChatMessageRow, 'id' | 'user_id'>[]
  ) {
    await this.ctx.db.transaction(async (conn) => {
      for (const msg of messages) {
        const messageId = uuidv7()

        await conn.sql`
          INSERT INTO chat_message (id, user_id, "role", content)
          VALUES (${messageId}, ${conversationId}, ${msg.role}, ${msg.content})
        `

        if (msg.function_calls && msg.function_calls.length > 0) {
          for (const call of msg.function_calls) {
            await conn.sql`
              INSERT INTO function_call (message_id, call_id, function_name, arguments, result, "provider", execution_time_ms)
              VALUES (
                ${messageId},
                ${call.call_id},
                ${call.function_name},
                ${call.arguments},
                ${call.result},
                ${call.provider},
                ${0}
              )
            `
          }
        }
      }
    })
  }
}
