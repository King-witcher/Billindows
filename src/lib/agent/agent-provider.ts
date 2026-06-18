import type { FunctionCallRowProvider } from '../database/types/function-call-row'
import type { DefaultContainer } from '../injector/dependencies'
import type { Tool } from './tool'
import type { AgentChatMessage } from './types'

export type ProviderToolRequest = {
  callId: string
  name: string
  arguments: Record<string, unknown>
}

export type ProviderCompletionResult = {
  outputText: string | null
  toolRequests: ProviderToolRequest[]
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface IAgentProvider<HistoryItem = unknown, ToolDefinition = unknown> {
  providerName: FunctionCallRowProvider
  getProviderHistory(databaseHistory: AgentChatMessage[]): HistoryItem[]
  getProviderTools(tools: Tool[], ctx: DefaultContainer): Promise<ToolDefinition[]>
  complete(
    instructions: string,
    history: HistoryItem[],
    tools?: ToolDefinition[],
  ): Promise<ProviderCompletionResult>
}
