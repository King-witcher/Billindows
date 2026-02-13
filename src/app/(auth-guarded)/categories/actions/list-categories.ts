'use server'

import { action } from '@/lib/server-wrappers'

export const listCategoriesAction = action(async (ctx) => {
  const jwt = await ctx.requireAuth()
  const categories = await ctx.repositories.categories.list(jwt.id)
  return categories
})
