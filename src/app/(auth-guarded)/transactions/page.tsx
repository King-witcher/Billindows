import { action } from '@/lib/server-actions'
import { ClientComponent } from './client-component'

export const metadata = {
  title: 'Billindows - Transactions',
}

export default action(async (ctx) => {
  const jwt = await ctx.requireAuth()

  const categories = await ctx.repositories.categories.list(jwt.id)

  const now = new Date()

  return <ClientComponent now={now} categories={categories} />
})
