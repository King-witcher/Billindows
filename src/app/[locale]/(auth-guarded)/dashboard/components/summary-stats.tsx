'use client'

import { BanknoteArrowDown, BanknoteArrowUp, Wallet } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/utils/utils'
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
  subtitle,
}: {
  label: string
  icon: ReactNode
  loading: boolean
  children: ReactNode
  subtitle: ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {icon}
        </div>
        {loading ? (
          <>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3.5 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold">{children}</div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function SummaryStats({ summary, loading }: Props) {
  const t = useTranslations('dashboard')
  const locale = useLocale()

  const income = summary?.totalIncome ?? 0
  const expenses = summary?.totalExpenses ?? 0
  const balance = income - expenses
  const spentPct = income > 0 ? Math.round((expenses / income) * 100) : 0

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label={t('income')}
        loading={loading}
        icon={<BanknoteArrowUp className="size-4 text-income" />}
        subtitle={t('breakdown', {
          fixed: formatMoney(summary?.fixedIncome ?? 0, locale),
          oneTime: formatMoney(summary?.oneTimeIncome ?? 0, locale),
        })}
      >
        <CurrencyText value={income} showSign />
      </StatCard>
      <StatCard
        label={t('expense')}
        loading={loading}
        icon={<BanknoteArrowDown className="size-4 text-expense" />}
        subtitle={t('breakdown', {
          fixed: formatMoney(summary?.fixedExpenses ?? 0, locale),
          oneTime: formatMoney(summary?.oneTimeExpenses ?? 0, locale),
        })}
      >
        <CurrencyText value={-expenses} showSign />
      </StatCard>
      <StatCard
        label={t('currentBalance')}
        loading={loading}
        icon={<Wallet className="size-4 text-muted-foreground" />}
        subtitle={income > 0 ? t('spentOfIncome', { percent: spentPct }) : t('noIncomeYet')}
      >
        <CurrencyText value={balance} />
      </StatCard>
    </div>
  )
}
