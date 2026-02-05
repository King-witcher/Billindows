'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoryBarChart } from './components'
import { DashboardSummary } from './components/balance-card'
import { CategoryPieChart } from './components/category-pie'
import { CategoryCards, CategoryTable } from './components/category-table'
import {
  type BalanceType,
  type DashboardData,
  prepareChartData,
  type TransactionType,
} from './helpers'

type DashboardContentProps = {
  data: DashboardData
  currentMonth: string
  currentYear: number
}

export function DashboardContent({ data, currentMonth, currentYear }: DashboardContentProps) {
  const [transactionType, setTransactionType] = useState<TransactionType>('expenses')
  const [balanceType, setBalanceType] = useState<BalanceType>('actual')

  const chartData = useMemo(() => {
    return prepareChartData(data.byCategory, transactionType, balanceType)
  }, [data.byCategory, transactionType, balanceType])

  return (
    <div className="flex-1 space-y-6 p-6">
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
      <DashboardSummary
        balance={data.actualBalance}
        forecast={data.forecastBalance}
        fixed={data.fixedBalance}
        oneTime={data.oneTimeBalance}
        monthProgress={data.monthProgress}
      />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
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
            <CategoryTable categories={data.byCategory} />
          </TabsContent>
          <TabsContent value="cards" className="mt-4">
            <CategoryCards categories={data.byCategory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
