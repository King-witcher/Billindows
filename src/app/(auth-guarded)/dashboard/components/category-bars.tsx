'use client'

import { FrownIcon, ListX } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
  onChangeTransactionType: (type: TransactionType) => void
  onChangeBalanceType: (type: BalanceType) => void
  loading: boolean
}

export function CategoryBarChart({
  chartData,
  transactionType,
  balanceType,
  onChangeTransactionType,
  onChangeBalanceType,
  loading,
}: Props) {
  const description = (() => {
    const typeLabel = transactionType === 'expenses' ? 'expenses' : 'income'
    const balanceLabel = balanceType === 'actual' ? 'actual' : 'forecasted'
    return `Showing ${balanceLabel} ${typeLabel} by category`
  })()

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Balance by Category</CardTitle>
        <CardDescription>{description}</CardDescription>
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
              <BarChart data={chartData ?? []} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-20}
                  textAnchor="end"
                  height={40}
                  className="fill-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="fill-muted-foreground"
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip content={CustomTooltip} />
                <Bar dataKey="value" name="Value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
