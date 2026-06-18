import type { LLMChatMessageRow } from '../database/types/llm-message-row'

export type AgentChatMessage = Omit<LLMChatMessageRow, 'id' | 'user_id'>
