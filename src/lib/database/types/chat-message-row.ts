import type { TEXT, UUID, UUID_v7 } from './postgres'

export type ChatMessageRowRole = 'user' | 'assistant' | 'system' | 'function_call' | 'internal'

export type ChatMessageRow = {
  id: UUID_v7
  user_id: UUID
  role: ChatMessageRowRole
  content: TEXT | null
}
