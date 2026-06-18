import { page } from '@/lib/server-wrappers'
import { DashboardContent } from './dashboard-content'

export const metadata = {
  title: 'Billindows - Dashboard',
}

export default page(async (ctx) => {
  const jwt = await ctx.requireAuth()

  const categories = await ctx.repositories.categories.list(jwt.id)

  return <DashboardContent categories={categories} />
})
