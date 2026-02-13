'use server'

import * as z from 'zod'
import { action, fail } from '@/lib/server-wrappers'

const schema = z.object({
  id: z.uuid(),
  recurrence: z.enum(['fixed', 'one-time']),
})

export const deleteTransactionAction = action(schema, async ({ recurrence, id }, ctx) => {
  // Require auth
  const { id: userId } = await ctx.requireAuth()

  // Ensure the transaction exists and belongs to the user
  const transaction = await ctx.repositories.transactions.find(id, recurrence)
  if (transaction?.user_id !== userId) {
    console.error('A user tried to delete a transaction that does not belong to them')
    fail('TransactionNotFound')
  }

  // Delete the transaction
  await ctx.repositories.transactions.delete(id, userId)
})
