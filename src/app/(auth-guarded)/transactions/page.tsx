import { page } from '@/lib/server-wrappers'
import { ClientComponent } from './client-component'

export const metadata = {
  title: 'Billindows - Transactions',
}

export default page(async (ctx) => {
  const jwt = await ctx.requireAuth()

  const categories = await ctx.repositories.categories.list(jwt.id)

  return <ClientComponent categories={categories} />
})
