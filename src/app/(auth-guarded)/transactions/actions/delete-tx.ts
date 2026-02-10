'use server'

import * as z from 'zod'
import { action, fail } from '@/lib/server-actions'

const schema = z.object({
  id: z.number(),
  recurrence: z.enum(['fixed', 'one-time']),
})

export const deleteTxAction = action(schema, async ({ recurrence, id }, ctx) => {
  // Require auth
  const jwt = await ctx.requireAuth()
  const userId = jwt.id

  // Ensure the transaction exists and belongs to the user
  const txOwner = await ctx.repositories.transactions.getTxOwner(id, recurrence)
  if (txOwner !== userId) {
    console.error('A user tried to delete a transaction that does not belong to them')
    fail('TransactionNotFound')
  }

  // Delete the transaction
  await ctx.repositories.transactions.delete(id, recurrence)
})
