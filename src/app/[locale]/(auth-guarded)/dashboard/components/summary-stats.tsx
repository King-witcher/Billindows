'use client'

import { BanknoteArrowDown, BanknoteArrowUp, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TarnsactionsSummary } from '../helpers'

type Props = {
  summary: TarnsactionsSummary | null
  loading: boolean
}

function StatCard({
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
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {icon}
        </div>
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <div className="text-2xl font-semibold">{children}</div>
        )}
      </CardContent>
    </Card>
  )
}

export function SummaryStats({ summary, loading }: Props) {
  const t = useTranslations('dashboard')

  const income = summary?.totalIncome ?? 0
  const expenses = summary?.totalExpenses ?? 0
  const balance = income - expenses

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label={t('income')}
        loading={loading}
        icon={<BanknoteArrowUp className="size-4 text-income" />}
      >
        <CurrencyText value={income} showSign />
      </StatCard>
      <StatCard
        label={t('expense')}
        loading={loading}
        icon={<BanknoteArrowDown className="size-4 text-expense" />}
      >
        <CurrencyText value={-expenses} showSign />
      </StatCard>
      <StatCard
        label={t('currentBalance')}
        loading={loading}
        icon={<Wallet className="size-4 text-muted-foreground" />}
      >
        <CurrencyText value={balance} />
      </StatCard>
    </div>
  )
}
