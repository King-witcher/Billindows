import type { UUID, UUID_v7 } from './postgres'

// From client_chat_message_view, which represents columns from chat_message that are relevant for client messages, and excludes tool calls and LLM messages that are only relevant for internal use.
export type ClientMessageRole = 'user' | 'assistant' | 'internal'

export type ClientMessageRow = {
  id: UUID_v7
  user_id: UUID
  role: ClientMessageRole
  content: string
  date: Date
}
