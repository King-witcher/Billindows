'use server'

import * as z from 'zod'
import type { Transaction } from '@/lib/database/repositories/transactions'
import { action, fail } from '@/lib/server-wrappers'

export type UpdateTxParams = {
  id: number
  transaction: Transaction // The table to be edited is determined by the transaction type.
}

const schema = z.object({
  id: z.int(),
  recurrence: z.enum(['fixed', 'one-time']),

  updateData: z.object({
    name: z.string().max(64),
    value: z.int(),
    year: z.int(),
    month: z.int().min(0).max(11),
    day: z.int().min(1).max(31),
    forecast: z.boolean(),
    category_id: z.int().min(0),
  }),
})

export const updateTxAction = action(schema, async ({ id, recurrence, updateData }, ctx) => {
  // TODO: validate transaction owner in a single query
  // Verify session
  const jwt = await ctx.requireAuth()

  // Ensure the transaction exists and belongs to the user
  const txOwner = await ctx.repositories.transactions.getTxOwner(id, recurrence)
  if (txOwner !== jwt.id) fail('TransactionNotFound')

  // Validate new category ownership
  const category = await ctx.repositories.categories.get(jwt.id, updateData.category_id)
  if (category?.user_id !== jwt.id) fail('CategoryNotFound')

  // Update the transaction
  await ctx.repositories.transactions.update(id, recurrence, updateData)
})
