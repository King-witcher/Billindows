'use server'

import { action } from '@/lib/server-wrappers'

export const listCategoriesAction = action(async (ctx) => {
  // Require auth
  const { id: userId } = await ctx.requireAuth()

  // List all categories for the user
  return ctx.repositories.categories.list(userId)
})
