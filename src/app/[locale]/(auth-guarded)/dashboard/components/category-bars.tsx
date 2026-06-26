'use client'

import { useLocale, useTranslations } from 'next-intl'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const compact = new Intl.NumberFormat(locale, { notation: 'compact' })

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{t('balanceByCategory')}</CardTitle>
        <CardDescription>
          {t(`filters.${balanceType}`)} · {t(`filters.${transactionType}`)}
        </CardDescription>
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
              <BarChart data={chartData} margin={{ top: 16 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-20}
                  textAnchor="end"
                  height={48}
                  className="fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  width={48}
                  className="fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${compact.format(value)}`}
                />
                <Tooltip content={CustomTooltip} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
