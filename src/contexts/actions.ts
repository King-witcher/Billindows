'use server'

import * as z from 'zod'
import { Agent } from '@/lib/agent'
import { action } from '@/lib/server-actions'
import { CreateTransactionTool } from '@/lib/tools/create-transaction'

const schema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'internal']),
      content: z.string(),
    }),
  ),
  input: z.string(),
})

export const callAgentAction = action(schema, async (data, ctx) => {
  const jwt = await ctx.requireAuth()
  const categories = await ctx.repositories.categories.list(jwt.id)
  const createTransactionTool = new CreateTransactionTool({ categories })

  const agent = new Agent({
    history: data.history
      .filter((msg) => msg.role !== 'internal')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    instructions: `You are an assistant responsible for creating transactions in a financial application. The current user name is ${jwt.name}, and today is ${new Date().toISOString().split('T')[0]}. You should avoid answering questions that are not related to the scope of the app.`,
    tools: [createTransactionTool],
  })

  const response = await agent.run(data.input)
  console.log(`Agent used a total of ${response.tokens} tokens.`)
  return {
    text: response.response,
    invalidate: {
      transactions: !!response.toolCalls.create_transaction,
    },
  }
})
