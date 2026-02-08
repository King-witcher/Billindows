import { buildDefaultContainer } from '@/lib/server-actions/dependencies'
import { ClientComponent } from './client-component'

export const metadata = {
  title: 'Billindows - Transactions',
}

export default async function Page() {
  const ctx = buildDefaultContainer()
  const userId = await ctx.userIdAsync
  if (!userId) return null

  const categories = await ctx.repositories.categories.list(userId)

  const now = new Date()

  return <ClientComponent now={now} categories={categories} />
}
