import type { INTEGER, TEXT, UUID_v7 } from './postgres'

export type ChatMessageRowRole = 'user' | 'assistant' | 'system' | 'function' | 'internal'

export type ChatMessageRowLLMProvider = 'azure' | 'anthropic' | 'gemini' | 'openai'

export type ChatMessageRowFunctionCall = {
  call_id: string
  function_name: string
  arguments: Record<string, unknown>
}

export type ChatMessageRow = {
  id: UUID_v7
  user_id: UUID_v7
  role: ChatMessageRowRole
  content: TEXT | null
  /** For role = 'function' */
  function_call_id: TEXT | null
  function_calls: ChatMessageRowFunctionCall[] | null
  /** For role = 'function' */
  function_execution_time_ms: INTEGER | null
  /** For role = 'assistant' | 'function' */
  llm_provider: ChatMessageRowLLMProvider | null
}
