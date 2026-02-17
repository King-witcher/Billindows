import { Agent } from '../agent/agent'
import type { IAgentProvider } from '../agent/agent-provider'
import type { AgentChatMessage } from '../agent/types'
import type { DefaultContainer } from '../injector/dependencies'
import { createTransactionTool } from './create-transaction-tool'

export type AppAgentConfig = {
  provider: IAgentProvider
  history: AgentChatMessage[]
  ctx: DefaultContainer
  userName: string
}

export class AppAgent extends Agent<string> {
  constructor(config: AppAgentConfig) {
    super({
      instructions: `You are an assistant responsible for creating transactions in a financial application. The current user name is ${config.userName}, and today is ${new Date().toISOString().split('T')[0]}. You should avoid answering questions that are not related to the scope of the app.`,
      history: config.history,
      tools: [createTransactionTool],
      ctx: config.ctx,
      provider: config.provider,
    })
  }
}
