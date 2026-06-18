import type { INTEGER, TEXT, UUID_v7 } from './postgres'

export type FunctionCallRowProvider = 'anthropic' | 'azure' | 'gemini' | 'openai'

export type FunctionCallRow = {
  id: INTEGER
  message_id: UUID_v7
  call_id: TEXT
  function_name: TEXT
  arguments: Record<TEXT, unknown>
  result: TEXT
  provider: FunctionCallRowProvider
  execution_time_ms: INTEGER
}
