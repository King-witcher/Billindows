'use client'

import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { BalanceType, TransactionType } from '../helpers'
import { ChartFilters } from './chart-filters'
import { CustomTooltip } from './tooltip'
import type { ChartData } from './types'

type Props = {
  chartData: ChartData[] | null
  transactionType: TransactionType
  balanceType: BalanceType
  loading: boolean
  onChangeTransactionType: (type: TransactionType) => void
  onChangeBalanceType: (type: BalanceType) => void
}

export function CategoryPieChart({
  chartData,
  transactionType,
  balanceType,
  loading,
  onChangeTransactionType,
  onChangeBalanceType,
}: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Distribution by Category</CardTitle>
        <CardDescription>Income and expenses breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="h-full w-full" />}
        <div className={cn('space-y-4-', loading && 'invisible')}>
          <ChartFilters
            balanceType={balanceType}
            transactionType={transactionType}
            onChangeBalanceType={onChangeBalanceType}
            onChangeTransactionType={onChangeTransactionType}
          />
          {!chartData?.length && (
            <div className="h-[350px] w-full flex gap-4 items-center justify-center">
              <p className="text-muted-foreground text-sm">
                You have no transactions for the selected filter.
              </p>
            </div>
          )}
          {Boolean(chartData?.length) && (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData ?? []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine
                />
                <Tooltip content={CustomTooltip} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
