'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNow } from '@/contexts/now/now-context'
import { useUser } from '@/contexts/user-context'
import { useTransactions } from '@/hooks/use-transaction/use-transactions'
import type { CategoryRow } from '@/lib/database/types'
import { listCategoriesAction } from './actions'
import { CategoryBarChart, CategoryTable, type ChartData } from './components'
import { CategoryPieChart } from './components/category-pie'
import { DashboardSummary } from './components/dashboard-summary'
import { type BalanceType, forecast, processDashboardData, type TransactionType } from './helpers'

type DashboardContentProps = {
  categories: CategoryRow[]
}

export function DashboardContent({ categories: initialCategories }: DashboardContentProps) {
  const user = useUser()
  const now = useNow()
  const monthProgress = now.day / now.daysInMonth
  const [transactionType, setTransactionType] = useState<TransactionType>('expenses')
  const [balanceType, setBalanceType] = useState<BalanceType>('actual')

  const categoriesQuery = useQuery({
    queryKey: ['categories', user.email],
    queryFn: listCategoriesAction,
    initialData: initialCategories,
    staleTime: Infinity, // Categories don't change often, so we can consider them fresh indefinitely
  })

  const transactionsQuery = useTransactions(now.year, now.month)

  const dashboardData = useMemo(() => {
    if (!transactionsQuery.data) return null
    return processDashboardData(transactionsQuery.data)
  }, [transactionsQuery.data])

  const categoriesMap = useMemo(() => {
    return new Map(categoriesQuery.data.map((cat) => [String(cat.id), cat]))
  }, [categoriesQuery.data])

  const chartData = useMemo<ChartData[] | null>(() => {
    if (!dashboardData) return null
    return (
      Object.entries(dashboardData.categories)
        // Map category summaries to array of [category, absolute balance] for charting, depending on selected balance type
        .map(([catId, summary]): [CategoryRow, number] => {
          const category = categoriesMap.get(catId)
          if (!category) throw new Error(`Category not found for ID ${catId}`)

          const totalBalance = summary.totalIncome - summary.totalExpenses

          if (balanceType === 'actual') {
            return [category, totalBalance]
          } else {
            const unforecasted = totalBalance - summary.forecastable
            const forecasted = unforecasted + forecast(summary.forecastable, monthProgress)
            return [category, forecasted]
          }
        })
        // Filter only categories that match the selected transaction type
        .filter(([, balance]) => {
          if (transactionType === 'income') return balance > 0
          return balance < 0
        })
        // Map to format required by charts
        .map(
          ([category, balance]): ChartData => ({
            name: category.name,
            value: Math.abs(balance) / 100,
            fill: category.color,
          }),
        )
        // Sort by value descending
        .sort((a, b) => b.value - a.value)
    )
  }, [dashboardData, transactionType, balanceType, categoriesMap, monthProgress])

  return (
    <div className="flex-1 space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Financial summary for {now.month} {now.year}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <DashboardSummary
        summary={dashboardData?.overall ?? null}
        loading={transactionsQuery.isLoading}
      />

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryBarChart
          chartData={chartData}
          transactionType={transactionType}
          balanceType={balanceType}
          onChangeTransactionType={setTransactionType}
          onChangeBalanceType={setBalanceType}
          loading={transactionsQuery.isLoading}
        />
        <CategoryPieChart
          chartData={chartData}
          transactionType={transactionType}
          balanceType={balanceType}
          onChangeTransactionType={setTransactionType}
          onChangeBalanceType={setBalanceType}
          loading={transactionsQuery.isLoading}
        />
      </div>

      {/* Category Details */}
      <CategoryTable
        categorySummaries={dashboardData?.categories ?? {}}
        categoriesMap={categoriesMap}
        monthProgress={monthProgress}
        loading={transactionsQuery.isLoading}
      />
    </div>
  )
}
