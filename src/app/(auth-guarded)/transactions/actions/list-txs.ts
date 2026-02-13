'use server'

import * as z from 'zod'
import { action } from '@/lib/server-wrappers'

const schema = z.object({
  filter: z.object({
    year: z.number().min(-700).max(2050),
    month: z.number().min(1).max(12),
  }),
})

export const listTransactionsAction = action(schema, async ({ filter }, ctx) => {
  // Require auth
  const { id: userId } = await ctx.requireAuth()

  // List all transactions for the user for the current month
  return ctx.repositories.transactions.list(userId, filter.year, filter.month)
})
