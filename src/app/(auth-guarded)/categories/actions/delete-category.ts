'use server'

import * as z from 'zod'
import { action, fail } from '@/lib/server-actions'

const schema = z.object({
  id: z.int().gt(0),
})

export const deleteCategoryAction = action(schema, async (data, ctx) => {
  const jwt = await ctx.requireAuth()

  const result = await ctx.repositories.categories.deleteForUser(jwt.id, data.id)
  if (result === null) fail('CategoryNotFound')
})
