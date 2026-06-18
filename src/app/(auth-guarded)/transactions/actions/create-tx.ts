'use server'

import * as z from 'zod'
import { fail } from '@/lib/server-wrappers'
import { action } from '@/lib/server-wrappers/wrappers'

const schema = z.object({
  category_id: z.uuid(),
  name: z.string().max(64),
  amount: z.int(),
  date: z.object({
    year: z.int(),
    month: z.int().min(1).max(12),
    day: z.int().min(1).max(31),
  }),
  recurrence: z.enum(['fixed', 'one-time']),
  forecast: z.boolean(),
})

export const createTxAction = action(schema, async (data, ctx) => {
  // TODO: Validate category ownership in a single query
  // Require authentication
  const jwt = await ctx.requireAuth()

  // Validate category ownership
  const category = await ctx.repositories.categories.get(data.category_id)
  if (category?.user_id !== jwt.id)
    fail('CategoryNotFound', `Category with id ${data.category_id} not found for user ${jwt.id}`)

  // Create the transaction
  await ctx.repositories.transactions.create(jwt.id, {
    amount: data.amount,
    category_id: data.category_id,
    name: data.name,
    date: data.date,
    recurrence: data.recurrence,
    forecast: data.forecast,
  })
})
