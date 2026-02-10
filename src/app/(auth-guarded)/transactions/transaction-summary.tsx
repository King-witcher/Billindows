'use client'

import { TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { type ComponentProps, useMemo } from 'react'
import type { Transaction } from '@/database/repositories/transactions'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/utils'

interface Props extends ComponentProps<'div'> {
  transactions: Transaction[]
}

export function TransactionSummary({ transactions, className, ...props }: Props) {
  const { income, expenses, balance } = useMemo(() => {
    let income = 0
    let expenses = 0
    for (const tx of transactions) {
      if (tx.value > 0) income += tx.value
      else expenses += tx.value
    }
    return { income, expenses, balance: income + expenses }
  }, [transactions])

  return (
    <div className={cn('flex gap-2 sm:gap-3 lg:flex-col', className)} {...props}>
      <SummaryCard
        label="Income"
        value={income}
        icon={<TrendingUp className="size-4" />}
        className="text-emerald-600 dark:text-emerald-400"
      />
      <SummaryCard
        label="Expenses"
        value={expenses}
        icon={<TrendingDown className="size-4" />}
        className="text-red-600 dark:text-red-400"
      />
      <SummaryCard
        label="Balance"
        value={balance}
        icon={<Wallet className="size-4" />}
        className={
          balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
        }
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  className,
}: {
  label: string
  value: number
  icon: React.ReactNode
  className?: string
}) {
  return (
    <div className="rounded-lg border bg-card p-3 sm:p-4 flex-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
        {icon}
        {label}
      </div>
      <p className={cn('mt-1 text-base font-bold tabular-nums sm:text-lg', className)}>
        {formatMoney(value)}
      </p>
    </div>
  )
}
