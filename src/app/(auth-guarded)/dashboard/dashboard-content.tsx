'use client'

import type { Category } from '@prisma/client'
import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryBarChart, CategoryTable, type ChartData } from './components'
import { CategoryPieChart } from './components/category-pie'
import { DashboardSummary } from './components/dashboard-summary'
import { type BalanceType, type DashboardData, forecast, type TransactionType } from './helpers'

type DashboardContentProps = {
  data: DashboardData
  categories: Category[]
  currentMonth: string
  currentYear: number
  monthProgress: number
}

export function DashboardContent({
  data,
  categories,
  currentMonth,
  currentYear,
  monthProgress,
}: DashboardContentProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('expenses')
  const [balanceType, setBalanceType] = useState<BalanceType>('actual')

  const categoriesMap = useMemo(() => {
    return new Map(categories.map((cat) => [String(cat.id), cat]))
  }, [categories])

  const chartData = useMemo<ChartData[]>(() => {
    return (
      Object.entries(data.categories)
        // Map category summaries to array of [category, absolute balance] for charting, depending on selected balance type
        .map(([catId, summary]): [Category, number] => {
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
  }, [data, transactionType, balanceType, categoriesMap, monthProgress])

  return (
    <div className="flex-1 space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Financial summary for {currentMonth} {currentYear}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <DashboardSummary summary={data.overall} monthProgress={monthProgress} />

      {/* Charts Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryBarChart
          chartData={chartData}
          transactionType={transactionType}
          balanceType={balanceType}
          onChangeTransactionType={setTransactionType}
          onChangeBalanceType={setBalanceType}
        />
        <CategoryPieChart
          chartData={chartData}
          transactionType={transactionType}
          balanceType={balanceType}
          onChangeTransactionType={setTransactionType}
          onChangeBalanceType={setBalanceType}
        />
      </div>

      {/* Category Details */}
      <div className="space-y-4">
        <Tabs defaultValue="table" className="w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Category Details</h3>
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="table" className="mt-4">
            <CategoryTable
              categorySummaries={data.categories}
              categoriesMap={categoriesMap}
              monthProgress={monthProgress}
            />
          </TabsContent>
          <TabsContent value="cards" className="mt-4">
            {/* <CategoryCards categories={data.byCategory} /> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
