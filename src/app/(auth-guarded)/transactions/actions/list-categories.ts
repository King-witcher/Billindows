'use server'

import { action } from '@/lib/server-actions'

export const listCategoriesAction = action(async (ctx) => {
  // Require auth
  const { id: userId } = await ctx.jwtAsync

  // List all categories for the user
  return ctx.repositories.categories.list(userId)
})
