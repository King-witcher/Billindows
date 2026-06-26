'use client'

import { useTranslations } from 'next-intl'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
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
  const t = useTranslations('dashboard')

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{t('distribution')}</CardTitle>
        <CardDescription>{t('distributionDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="h-87.5 w-full" />}
        <div className={cn('space-y-4', loading && 'hidden')}>
          <ChartFilters
            balanceType={balanceType}
            transactionType={transactionType}
            onChangeBalanceType={onChangeBalanceType}
            onChangeTransactionType={onChangeTransactionType}
          />
          {!chartData?.length ? (
            <div className="flex h-87.5 w-full items-center justify-center">
              <p className="text-sm text-muted-foreground">{t('noTxForFilter')}</p>
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
                  innerRadius={55}
                  outerRadius={105}
                  paddingAngle={2}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={CustomTooltip} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
