'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  year: number
  month: number
  isCurrentMonth: boolean
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

export function MonthSelector({ year, month, isCurrentMonth, onPrev, onNext, onToday }: Props) {
  const locale = useLocale()
  const t = useTranslations('transactions')

  const label = useMemo(() => {
    const formatted = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
      new Date(year, month - 1, 1),
    )
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }, [locale, year, month])

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" onClick={onPrev} aria-label={t('prevMonth')}>
        <ChevronLeft />
      </Button>
      <span className="min-w-40 text-center text-sm font-medium tabular-nums">{label}</span>
      <Button variant="outline" size="icon" onClick={onNext} aria-label={t('nextMonth')}>
        <ChevronRight />
      </Button>
      {!isCurrentMonth && (
        <Button variant="ghost" size="sm" onClick={onToday} className="ml-1">
          {t('today')}
        </Button>
      )}
    </div>
  )
}
