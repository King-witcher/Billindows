import { CategoriesRepository } from '@/database/repositories/categories'
import { TransactionsRepository } from '@/database/repositories/transactions'
import { verifySession } from '@/lib/session'
import { DashboardContent } from './dashboard-content'
import { processDashboardData } from './helpers'

export const metadata = {
  title: 'Billindows - Dashboard',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null
  const categoryRepo = new CategoriesRepository(session.id)
  const transactionsRepo = new TransactionsRepository()

  const now = new Date()
  const daysInTheMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()
  const monthProgress = currentDay / daysInTheMonth

  const [transactions, categories] = await Promise.all([
    transactionsRepo.listAllTxs(session.id, now.getFullYear(), now.getMonth()),
    categoryRepo.listCategories(),
  ])

  const grouped = Object.groupBy(transactions, (tx) => tx.type)

  const dashboardData = processDashboardData(grouped.fixed || [], grouped['one-time'] || [])

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const currentMonth = monthNames[now.getMonth()]
  const currentYear = now.getFullYear()

  return (
    <DashboardContent
      data={dashboardData}
      monthProgress={monthProgress}
      categories={categories}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  )
}
