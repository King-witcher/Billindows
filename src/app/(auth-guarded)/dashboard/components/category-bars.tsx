'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { BalanceType, TransactionType } from '../helpers'
import { ChartFilters } from './chart-filters'
import { CustomTooltip } from './tooltip'
import type { ChartData } from './types'

type Props = {
  chartData: ChartData[]
  transactionType: TransactionType
  balanceType: BalanceType
  onChangeTransactionType: (type: TransactionType) => void
  onChangeBalanceType: (type: BalanceType) => void
}

export function CategoryBarChart({
  chartData,
  transactionType,
  balanceType,
  onChangeTransactionType,
  onChangeBalanceType,
}: Props) {
  const description = (() => {
    const typeLabel = transactionType === 'expenses' ? 'expenses' : 'income'
    const balanceLabel = balanceType === 'actual' ? 'actual' : 'forecasted'
    return `Showing ${balanceLabel} ${typeLabel} by category`
  })()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance by Category</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartFilters
          balanceType={balanceType}
          transactionType={transactionType}
          onChangeBalanceType={onChangeBalanceType}
          onChangeTransactionType={onChangeTransactionType}
        />

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-75 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 20 }}>
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
      </CardContent>
    </Card>
  )
}
