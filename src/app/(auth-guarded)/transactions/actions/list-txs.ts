'use server'

import * as z from 'zod'
import { action } from '@/lib/server-actions'

const schema = z.object({
  now: z.date(),
})

export const listTxs = action(schema, async ({ now }, ctx) => {
  // Require auth
  const { id: userId } = await ctx.requireAuth()

  // List all transactions for the user for the current month
  return ctx.repositories.transactions.listAllTxs(userId, now.getFullYear(), now.getMonth())
})
