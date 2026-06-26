'use client'

import { BanknoteArrowDown, BanknoteArrowUp, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ReactNode, useMemo } from 'react'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AbstractTransaction } from '@/lib/database/types'

interface Props {
  /** The whole month's transactions — the summary always reflects the full month, not active filters. */
  transactions: AbstractTransaction[]
  loading: boolean
}

export function TransactionSummary({ transactions, loading }: Props) {
  const t = useTranslations('transactions')

  const { income, expenses, balance } = useMemo(() => {
    let income = 0
    let expenses = 0
    for (const tx of transactions) {
      if (tx.amount > 0) income += tx.amount
      else expenses += tx.amount
    }
    return { income, expenses, balance: income + expenses }
  }, [transactions])

  return (
    <div className="grid grid-cols-3 gap-3">
      <SummaryCard
        label={t('income')}
        loading={loading}
        icon={<BanknoteArrowUp className="size-4 text-income" />}
      >
        <CurrencyText value={income} />
      </SummaryCard>
      <SummaryCard
        label={t('expense')}
        loading={loading}
        icon={<BanknoteArrowDown className="size-4 text-expense" />}
      >
        <CurrencyText value={expenses} />
      </SummaryCard>
      <SummaryCard
        label={t('balance')}
        loading={loading}
        icon={<Wallet className="size-4 text-muted-foreground" />}
      >
        <CurrencyText value={balance} />
      </SummaryCard>
    </div>
  )
}

function SummaryCard({
  label,
  icon,
  loading,
  children,
}: {
  label: string
  icon: ReactNode
  loading: boolean
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1.5 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          {icon}
          <span className="truncate">{label}</span>
        </div>
        {loading ? (
          <Skeleton className="h-6 w-20 sm:h-7" />
        ) : (
          <p className="text-base font-semibold sm:text-lg">{children}</p>
        )}
      </CardContent>
    </Card>
  )
}
