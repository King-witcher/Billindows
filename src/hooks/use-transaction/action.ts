'use server'

import z from 'zod'
import { action } from '@/lib/server-wrappers'

const schema = z.object({
  filter: z.object({
    year: z.number().int().min(1963).max(3026),
    month: z.number().int().min(1).max(12),
  }),
})

export const listTransactionsAction = action(schema, async (query, ctx) => {
  const jwt = await ctx.requireAuth()

  const transactions = await ctx.repositories.transactions.list(
    jwt.id,
    query.filter.year,
    query.filter.month,
  )
  return transactions
})
