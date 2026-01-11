'use server'

import { verifySession } from '@/lib/session'
import type { Message } from './chat-context'
import { Agent } from '@/lib/agent'
import { createTransactionTool } from '@/lib/tools/create-transaction'

export async function handleUserMessage(history: Message[], message: string) {
  const session = await verifySession()
  if (!session) return 'Usuário não autenticado.'

  const agent = new Agent({
    history: history
      .filter((msg) => msg.role !== 'internal')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    instructions: `You are responsible for handling user requests. The userId is ${session.id}. Today is ${new Date().toISOString().split('T')[0]}.`,
    tools: [createTransactionTool],
  })

  const response = await agent.run(message)

  return response
}
