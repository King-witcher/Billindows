'use client'

import { useQuery } from '@tanstack/react-query'
import { FolderPlus, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNow } from '@/contexts/now/now-context'
import { useUser } from '@/contexts/user-context'
import { useTransactions } from '@/hooks/use-transaction/use-transactions'
import { Link } from '@/i18n/navigation'
import type { CategoryRow } from '@/lib/database/types'
import { listCategoriesAction } from './actions'
import {
  CategoryBarChart,
  CategoryPieChart,
  CategoryTable,
  type ChartData,
  ForecastHero,
  SummaryStats,
} from './components'
import { type BalanceType, forecast, processDashboardData, type TransactionType } from './helpers'

type DashboardContentProps = {
  categories: CategoryRow[]
}

export function DashboardContent({ categories: initialCategories }: DashboardContentProps) {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const user = useUser()
  const now = useNow()
  const monthProgress = now.day / now.daysInMonth
  const [transactionType, setTransactionType] = useState<TransactionType>('expenses')
  const [balanceType, setBalanceType] = useState<BalanceType>('actual')

  const categoriesQuery = useQuery({
    queryKey: ['categories', user.email],
    queryFn: listCategoriesAction,
    initialData: initialCategories,
    staleTime: Infinity,
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
    return Object.entries(dashboardData.categories)
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
      .filter(([, balance]) => {
        if (transactionType === 'income') return balance > 0
        return balance < 0
      })
      .map(
        ([category, balance]): ChartData => ({
          name: category.name,
          value: Math.abs(balance) / 100,
          fill: category.color,
        }),
      )
      .sort((a, b) => b.value - a.value)
  }, [dashboardData, transactionType, balanceType, categoriesMap, monthProgress])

  const monthLabel = useMemo(() => {
    const date = new Date(now.year, now.month - 1, 1)
    const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date)
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [locale, now.year, now.month])

  const firstName = user.name.split(' ')[0]
  const loading = transactionsQuery.isLoading
  const hasCategories = categoriesQuery.data.length > 0
  const hasTransactions = (transactionsQuery.data?.length ?? 0) > 0

  // No categories yet → can't create transactions; guide the user there first.
  if (!hasCategories) {
    return (
      <div className="mx-auto flex min-h-full max-w-2xl items-center justify-center p-6">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <FolderPlus className="size-6" />
            </div>
            <h2 className="text-lg font-semibold">{t('emptyCategoriesTitle')}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t('emptyCategoriesBody')}</p>
            <Button asChild className="mt-2">
              <Link href="/categories">
                <Plus /> {t('createCategory')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t('greeting', { name: firstName })}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{monthLabel}</h1>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/transactions">
            <Plus /> {t('newTransaction')}
          </Link>
        </Button>
      </div>

      <ForecastHero summary={dashboardData?.overall ?? null} loading={loading} />
      <SummaryStats summary={dashboardData?.overall ?? null} loading={loading} />

      {!loading && !hasTransactions ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Plus className="size-6" />
            </div>
            <h2 className="text-lg font-semibold">{t('emptyTitle')}</h2>
            <p className="max-w-sm text-sm text-muted-foreground">{t('emptyBody')}</p>
            <Button asChild className="mt-2">
              <Link href="/transactions">
                <Plus /> {t('newTransaction')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <CategoryBarChart
              chartData={chartData}
              transactionType={transactionType}
              balanceType={balanceType}
              onChangeTransactionType={setTransactionType}
              onChangeBalanceType={setBalanceType}
              loading={loading}
            />
            <CategoryPieChart
              chartData={chartData}
              transactionType={transactionType}
              balanceType={balanceType}
              onChangeTransactionType={setTransactionType}
              onChangeBalanceType={setBalanceType}
              loading={loading}
            />
          </div>

          <CategoryTable
            categorySummaries={dashboardData?.categories ?? {}}
            categoriesMap={categoriesMap}
            monthProgress={monthProgress}
            loading={loading}
          />
        </>
      )}
    </div>
  )
}
