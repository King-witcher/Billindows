'use server'

import * as z from 'zod'
import { fail } from '@/lib/server-actions'
import { action } from '@/lib/server-actions/action-wrapper'

export type CreateTxErrors = {
  TestError: undefined
}

const schema = z.object({
  name: z.string().max(64),
  value: z.int(),
  year: z.int(),
  month: z.int().min(0).max(11),
  day: z.int().min(1).max(31),
  type: z.enum(['fixed', 'one-time']),
  forecast: z.boolean(),
  category_id: z.number().min(0),
})

export const createTxAction = action(schema, async (data, ctx) => {
  // TODO: Validate category ownership in a single query
  // Require authentication
  const jwt = await ctx.requireAuth()

  // Validate category ownership
  const category = await ctx.repositories.categories.find(jwt.id, data.category_id)
  if (!category)
    fail('category-not-found', `Category with id ${data.category_id} not found for user ${jwt.id}`)

  // Create the transaction
  await ctx.repositories.transactions.create(data)
})
