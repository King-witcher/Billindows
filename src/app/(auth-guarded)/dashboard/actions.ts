'use server'

import z from 'zod'
import { action } from '@/lib/server-wrappers'

export const listCategoriesAction = action(async (ctx) => {
  const jwt = await ctx.requireAuth()

  const categories = await ctx.repositories.categories.list(jwt.id)
  return categories
})

const listTransactionsSchema = z.object({
  filter: z.object({
    year: z.number().int().min(1963).max(3026),
    month: z.number().int().min(1).max(12),
  }),
})

export const listTransactionsAction = action(listTransactionsSchema, async (input, ctx) => {
  const jwt = await ctx.requireAuth()

  const transactions = await ctx.repositories.transactions.list(
    jwt.id,
    input.filter.year,
    input.filter.month,
  )
  return transactions
})
