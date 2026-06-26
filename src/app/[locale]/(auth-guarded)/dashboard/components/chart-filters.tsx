'use client'

import { BanknoteArrowDown, BanknoteArrowUp, Calendar, TrendingUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { BalanceType, TransactionType } from '../helpers'

type Props = {
  transactionType: TransactionType
  balanceType: BalanceType
  onChangeTransactionType: (type: TransactionType) => void
  onChangeBalanceType: (type: BalanceType) => void
  className?: string
}

export function ChartFilters({
  transactionType,
  balanceType,
  onChangeTransactionType,
  onChangeBalanceType,
  className,
}: Props) {
  const t = useTranslations('dashboard.filters')

  return (
    <div className={cn('flex flex-row flex-wrap gap-2', className)}>
      <Tabs
        value={transactionType}
        onValueChange={(v) => onChangeTransactionType(v as TransactionType)}
      >
        <TabsList>
          <TabsTrigger value="expenses" aria-label={t('expenses')}>
            <BanknoteArrowDown className="text-expense" />
            <span className="hidden sm:inline-block">{t('expenses')}</span>
          </TabsTrigger>
          <TabsTrigger value="income" aria-label={t('income')}>
            <BanknoteArrowUp className="text-income" />
            <span className="hidden sm:inline-block">{t('income')}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs value={balanceType} onValueChange={(v) => onChangeBalanceType(v as BalanceType)}>
        <TabsList>
          <TabsTrigger value="actual" aria-label={t('actual')}>
            <Calendar />
            <span className="hidden sm:inline-block">{t('actual')}</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" aria-label={t('forecast')}>
            <TrendingUp />
            <span className="hidden sm:inline-block">{t('forecast')}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
