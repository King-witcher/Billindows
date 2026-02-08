'use server'

import { z } from 'zod'
import { action, fail } from '@/lib/server-actions'
import { sanitizeSpaces } from '@/utils/utils'

const schema = z.object({
  id: z.coerce.number().gt(0),
  updateData: z.object({
    name: z.string().nonempty().max(30).transform(sanitizeSpaces),
    goal: z.int().nullable(),
    color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/), // Hex color validation
  }),
})

export const updateCategoryAction = action(schema, async (data, ctx) => {
  const jwt = await ctx.requireAuth()

  const result = await ctx.repositories.categories.updateForUser(jwt.id, data.id, {
    color: data.updateData.color,
    goal: data.updateData.goal,
    name: data.updateData.name,
  })

  if (result === 0) fail('CategoryNotFound')
})
