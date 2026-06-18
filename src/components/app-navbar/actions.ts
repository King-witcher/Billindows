'use server'

import { redirect } from 'next/navigation'
import { action } from '@/lib/server-wrappers'

export const logoutAction = action(async (ctx) => {
  await ctx.authService.deleteSession()
  redirect('/login')
})
