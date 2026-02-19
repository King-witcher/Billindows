'use server'

import * as z from 'zod'
import { OpenAiProvider } from '@/lib/agent/openai-provider'
import { AppAgent } from '@/lib/agents/app-agent'
import { action } from '@/lib/server-wrappers'
import type { ClientMessage, SendMessageResult } from './types'

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

export type Cursor = {
  id: string
}

export type ListMessagesResult = {
  messages: ClientMessage[]
  cursor: Cursor | null
}

const querySchema = z.object({
  limit: z.int().positive().max(100).optional().default(10),
  cursor: z
    .object({
      id: z.string(),
    })
    .nullable()
    .optional()
    .default(null),
})

export const listMessagesAction = action(
  querySchema,
  async (query, ctx): Promise<ListMessagesResult> => {
    const jwt = await ctx.requireAuth()

    const lastId = query.cursor?.id ?? null

    const messages = await ctx.repositories.chat.listClientMessages(jwt.id, {
      limit: query.limit,
      before: lastId ? { id: lastId } : null,
    })

    const results = messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      sentAt: msg.date,
    }))

    const newCursor = results.length < query.limit ? null : { id: results[results.length - 1].id }

    return {
      messages: results,
      cursor: newCursor,
    }
  },
)
