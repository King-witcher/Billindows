'use server'

import * as z from 'zod'
import { action } from '@/lib/server-wrappers'
import { sanitizeSpaces } from '@/utils/utils'

const schema = z.object({
  name: z.string().nonempty().max(30).transform(sanitizeSpaces),
  goal: z.int().nullable(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/), // Hex color validation
})

export const createCategoryAction = action(schema, async (data, ctx) => {
  // Require auth and get user ID from JWT
  const jwt = await ctx.requireAuth()

  await ctx.repositories.categories.create({
    color: data.color,
    name: data.name,
    goal: data.goal,
    user_id: jwt.id,
  })
})
