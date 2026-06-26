'use client'

import { BanknoteArrowDown, BanknoteArrowUp, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ComponentProps, type ReactNode, useMemo } from 'react'
import { CurrencyText } from '@/components/atoms/currency-text'
import type { AbstractTransaction } from '@/lib/database/types'
import { cn } from '@/lib/utils'

interface Props extends ComponentProps<'div'> {
  transactions: AbstractTransaction[]
}

export function TransactionSummary({ transactions, className, ...props }: Props) {
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
    <div className={cn('flex gap-2 sm:gap-3 lg:flex-col', className)} {...props}>
      <SummaryCard label={t('income')} icon={<BanknoteArrowUp className="size-4 text-income" />}>
        <CurrencyText value={income} />
      </SummaryCard>
      <SummaryCard
        label={t('expense')}
        icon={<BanknoteArrowDown className="size-4 text-expense" />}
      >
        <CurrencyText value={expenses} />
      </SummaryCard>
      <SummaryCard label={t('balance')} icon={<Wallet className="size-4 text-muted-foreground" />}>
        <CurrencyText value={balance} />
      </SummaryCard>
    </div>
  )
}

function SummaryCard({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex-1 rounded-lg border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-base font-semibold sm:text-lg">{children}</p>
    </div>
  )
}
