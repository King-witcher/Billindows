'use server'

import * as z from 'zod'
import { OpenAiProvider } from '@/lib/agent/openai-provider'
import { AppAgent } from '@/lib/agents/app-agent'
import { action } from '@/lib/server-wrappers'
import type { ClientMessage, SendMessageResult } from './types'

const schema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'internal']),
      content: z.string(),
    }),
  ),
  input: z.string(),
})

const sendMessageSchema = z.string().max(512)

export const sendMessageAction = action(
  sendMessageSchema,
  async (input, ctx): Promise<SendMessageResult> => {
    const jwt = await ctx.requireAuth()

    const saveInputPromise = ctx.repositories.chat.createClientMessage({
      user_id: jwt.id,
      content: input,
    })
    const history = await ctx.repositories.chat.listLLMessages(jwt.id, 10)

    const provider = new OpenAiProvider(process.env.OPENAI_MODEL || 'gpt-5.1')
    const agent = new AppAgent({
      ctx,
      history,
      provider,
      userName: jwt.name,
    })

    const response = await agent.run(input)
    await saveInputPromise
    ctx.repositories.chat.createLLMMessages(jwt.id, ...response.output)

    return {
      response: response.outputText,
      invalidate: {
        transactions: true,
        categories: false,
      },
    }
  },
)

export const listMessagesAction = action(async (ctx): Promise<ClientMessage[]> => {
  const jwt = await ctx.requireAuth()

  const messages = await ctx.repositories.chat.listClientMessages(jwt.id)
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    sentAt: msg.date,
  }))
})
