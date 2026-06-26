'use server'

import * as z from 'zod'
import { action, fail } from '@/lib/server-wrappers'

const schema = z.object({
  id: z.uuid(),
  recurrence: z.enum(['fixed', 'one-time']),

  updateData: z.object({
    category_id: z.uuid(),
    name: z.string().max(64),
    amount: z.int(),
    date: z.object({
      day: z.int().min(1).max(31),
      month: z.int().min(1).max(12),
      year: z.int().min(-700).max(3026),
    }),
    forecast: z.boolean(),
  }),
})

export const updateTransactionAction = action(
  schema,
  async ({ id, recurrence, updateData }, ctx) => {
    // TODO: validate transaction owner in a single query
    // Verify session
    const jwt = await ctx.requireAuth()

    // Ensure the transaction exists and belongs to the user
    const txOwner = await ctx.repositories.transactions.find(id, recurrence)
    if (txOwner?.user_id !== jwt.id) fail('TransactionNotFound')

    // Validate new category ownership
    const category = await ctx.repositories.categories.get(updateData.category_id)
    if (category?.user_id !== jwt.id) fail('CategoryNotFound')

    // Update the transaction
    await ctx.repositories.transactions.update(id, recurrence, updateData)
  },
)
