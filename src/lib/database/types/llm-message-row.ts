import type { FunctionCallRowProvider } from './function-call-row'
import type { UUID, UUID_v7 } from './postgres'

// From llm_chat_message_view, which represents columns from chat_message that are relevant for llm calls, and excludes messages that are only relevant for client messages.

export type LLMChatMessageRowRole = 'user' | 'assistant' | 'system' | 'function_call'

export type LLMChatMessageRowFunctionCall = {
  call_id: string
  function_name: string
  arguments: Record<string, unknown>
  result: string
  provider: FunctionCallRowProvider
}

export type LLMChatMessageRow = {
  id: UUID_v7
  user_id: UUID
  content: string | null
} & (
  | {
      role: Exclude<LLMChatMessageRowRole, 'function_call'>
      function_calls: null
    }
  | {
      role: 'function_call'
      function_calls: LLMChatMessageRowFunctionCall[]
    }
)
