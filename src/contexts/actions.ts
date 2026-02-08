'use server'

import { CategoriesRepository } from '@/database/repositories/categories'
import { Agent } from '@/lib/agent'
import { verifySession } from '@/lib/session'
import { CreateTransactionTool } from '@/lib/tools/create-transaction'
import type { Message } from './chat-context'

type CallAgentResult =
  | {
      success: true
      text: string
      invalidate: {
        transactions: boolean
      }
    }
  | {
      success: false
      error: AgentError
    }

export type AgentError = 'user-not-found'

export async function callAgent(history: Message[], message: string): Promise<CallAgentResult> {
  const session = await verifySession()
  if (!session)
    return {
      success: false,
      error: 'user-not-found',
    }

  const categoriesRepository = new CategoriesRepository(session.id)
  const categories = await categoriesRepository.list()
  const createTransactionTool = new CreateTransactionTool({ categories })

  const agent = new Agent({
    history: history
      .filter((msg) => msg.role !== 'internal')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    instructions: `You are an assistant responsible for creating transactions in a financial application. The current user name is ${session.name}, and today is ${new Date().toISOString().split('T')[0]}. You should avoid answering questions that are not related to the scope of the app.`,
    tools: [createTransactionTool],
  })

  const response = await agent.run(message)
  console.log(`Agent used a total of ${response.tokens} tokens.`)

  return {
    success: true,
    text: response.response,
    invalidate: {
      transactions: !!response.toolCalls.create_transaction,
    },
  }
}
