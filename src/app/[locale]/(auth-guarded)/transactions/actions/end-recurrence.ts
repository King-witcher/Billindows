'use server'

import * as z from 'zod'
import { action, fail } from '@/lib/server-wrappers'

const schema = z.object({
  id: z.uuid(),
})

export const endRecurrenceAction = action(schema, async ({ id }, ctx) => {
  const jwt = await ctx.requireAuth()

  // Ensure the fixed transaction exists and belongs to the user.
  const tx = await ctx.repositories.transactions.find(id, 'fixed')
  if (tx?.user_id !== jwt.id) fail('TransactionNotFound')

  // Stop it from next month onward (keeps the current month counted).
  const today = new Date()
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)

  await ctx.repositories.transactions.endRecurrence(id, jwt.id, endDate)
})
