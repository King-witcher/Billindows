'use server'

import * as z from 'zod'
import { action, fail } from '@/lib/server-wrappers'

const schema = z.object({
  id: z.uuid(),
})

export const deleteCategoryAction = action(schema, async (data, ctx) => {
  const jwt = await ctx.requireAuth()

  const result = await ctx.repositories.categories.delete(data.id, jwt.id)
  if (result === null) fail('CategoryNotFound')
})
