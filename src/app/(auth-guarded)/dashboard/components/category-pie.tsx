'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
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

export function CategoryPieChart({
  chartData,
  transactionType,
  balanceType,
  onChangeTransactionType,
  onChangeBalanceType,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution by Category</CardTitle>
        <CardDescription>Income and expenses breakdown</CardDescription>
      </CardHeader>
      <CardContent>
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
            <PieChart>
              <Pie
                data={chartData}
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
      </CardContent>
    </Card>
  )
}
