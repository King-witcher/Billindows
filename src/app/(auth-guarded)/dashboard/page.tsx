import { buildDefaultContainer } from '@/lib/server-actions/dependencies'
import { DashboardContent } from './dashboard-content'
import { processDashboardData } from './helpers'

export const metadata = {
  title: 'Billindows - Dashboard',
}

export default async function Page() {
  const deps = buildDefaultContainer()
  const jwt = await deps.jwtAsync

  const categoriesRepo = deps.repositories.categories
  const transactionsRepo = deps.repositories.transactions

  const daysInTheMonth = new Date(deps.date.year, deps.date.month + 1, 0).getDate()
  const currentDay = deps.date.day
  const monthProgress = currentDay / daysInTheMonth

  const [transactions, categories] = await Promise.all([
    transactionsRepo.listAllTxs(jwt.id, deps.date.year, deps.date.month),
    categoriesRepo.list(jwt.id),
  ])

  const { fixed = [], 'one-time': oneTime = [] } = Object.groupBy(transactions, (tx) => tx.type)

  const dashboardData = processDashboardData(fixed, oneTime)

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
  const currentMonth = monthNames[deps.date.month]
  const currentYear = deps.date.year

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
