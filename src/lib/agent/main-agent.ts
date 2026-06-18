import { Agent } from 'http'
import type { ResponseInput } from 'openai/resources/responses/responses'

export class MainAgent extends Agent {
  constructor(history: ResponseInput) {
    super({
      history: history
        .filter((msg) => msg.role !== 'internal')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      instructions: `You are an assistant responsible for creating transactions in a financial application. The current user name is ${jwt.name}, and today is ${new Date().toISOString().split('T')[0]}. You should avoid answering questions that are not related to the scope of the app.`,
      tools: [createTransactionTool],
    })
  }
}
