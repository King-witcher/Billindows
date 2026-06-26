'use client'

import { useLocale, useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { CurrencyText } from '@/components/atoms/currency-text'

interface Props {
  day: number
  year: number
  /** Month from 1 to 12. */
  month: number
  isToday: boolean
  /** Net balance of the day's visible transactions, in cents. */
  subtotal: number
  children: ReactNode
}

export function DayGroup({ day, year, month, isToday, subtotal, children }: Props) {
  const locale = useLocale()
  const t = useTranslations('transactions')
  const date = new Date(year, month - 1, day)
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)

  return (
    <div className="flex flex-col gap-2">
      <div className="sticky top-0 z-10 flex items-center gap-2 bg-background/80 px-1 py-1.5 backdrop-blur-sm">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary tabular-nums">
          {day}
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-xs font-medium capitalize text-muted-foreground">{weekday}</span>
          {isToday && <span className="text-[10px] font-semibold text-primary">{t('today')}</span>}
        </div>
        <div className="mx-2 h-px flex-1 bg-border" />
        <CurrencyText value={subtotal} className="text-xs font-medium" />
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}
