import type { MessageRow } from '@prisma/client'
import type {
  ResponseFunctionToolCall,
  ResponseInputItem,
} from 'openai/resources/responses/responses.mjs'
import { uuidv7 } from 'uuidv7'
import type { DependencyContainer } from '@/lib/injector/dependencies'

export type InternalMessage = {
  type: 'message'
  role: 'internal'
  content: string
}

export type MessageRowContent =
  | ResponseFunctionToolCall // Hidden from client
  | ResponseInputItem.FunctionCallOutput // Hidden from client
  | {
      type: 'message'
      role: 'user' | 'assistant' | 'internal'
      content: string
    }

export type CreateMessageRowData = {
  user_id: string
  content: MessageRowContent
  order?: number
}

export type ProcessedMessage = {
  id: string
  user_id: number
  content: MessageRowContent
  date: Date // Extracted from the id
}

export class MessagesRepository {
  constructor(private ctx: DependencyContainer) {}

  async create(row: CreateMessageRowData): Promise<ProcessedMessage> {
    const id = uuidv7()

    const [message] = await this.ctx.db.sql<MessageRow>`
      INSERT INTO messages ("id", "user_id", "content")
      VALUES (${id}, ${row.user_id}, ${row.content})
      RETURNING *
    `

    return {
      id: message.id,
      user_id: message.user_id,
      content: message.content as unknown as MessageRowContent,
      date: new Date(),
    }
  }

  async listByUser(user_id: number): Promise<ProcessedMessage[]> {
    const messages = await this.ctx.db.sql<ProcessedMessage>`
      SELECT "id", "user_id", "content", uuidv7_timestamp("id") AS "date"
      FROM messages
      WHERE "user_id" = ${user_id}
      ORDER BY "id" DESC
    `

    return messages
  }
}
