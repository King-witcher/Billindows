'use client'

import { Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNow } from '@/contexts/now/now-context'
import { formatMoney } from '@/utils/utils'
import { forecast, type TarnsactionsSummary } from '../helpers'

type Props = {
  summary: TarnsactionsSummary | null
  loading: boolean
}

export function ForecastHero({ summary, loading }: Props) {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const now = useNow()

  const monthProgress = now.day / now.daysInMonth
  const progressPct = Math.round(monthProgress * 100)
  const earlyMonth = monthProgress < 0.2

  const balance = summary ? summary.totalIncome - summary.totalExpenses : 0
  const projected = summary
    ? balance - summary.forecastable + forecast(summary.forecastable, monthProgress)
    : 0
  const positive = projected >= 0

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-md">
      <CardContent className="p-6 sm:p-7">
        <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
          <Sparkles className="size-4" />
          {t('projectedBalance')}
        </div>

        {loading ? (
          <Skeleton className="mt-2 h-11 w-56 bg-primary-foreground/20" />
        ) : (
          <p className="tnum mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
            {formatMoney(projected, locale)}
          </p>
        )}

        <p className="mt-3 flex items-center gap-1.5 text-sm text-primary-foreground/90">
          {positive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          {loading ? '—' : positive ? t('onTrack') : t('offTrack')}
        </p>
        <p className="mt-1 text-xs text-primary-foreground/70">
          {earlyMonth ? t('earlyMonthHint') : t('projectedHint')} ·{' '}
          {t('monthProgress', { percent: progressPct })}
        </p>
      </CardContent>
    </Card>
  )
}
