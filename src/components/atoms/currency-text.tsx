'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useLocale } from 'next-intl'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/utils'

interface CurrencyTextProps extends ComponentProps<'span'> {
  /** Amount in cents. `null` renders the empty placeholder (zero is a real value). */
  value: number | null
  /** Override the active locale (defaults to the current i18n locale). */
  locale?: string
  /** Show a direction arrow (income up / expense down) alongside the value. */
  showSign?: boolean
  /** Text shown when value is null. */
  emptyLabel?: string
}

/**
 * Canonical money renderer: locale-aware formatting (R$ 1.234,56 in pt-BR,
 * R$ 1,234.56 in en), tabular figures, income/expense color tokens, and an
 * accessible direction arrow that does not rely on color alone. Distinguishes a
 * real R$ 0,00 from "no value" (null).
 */
export function CurrencyText({
  value,
  locale,
  showSign = false,
  emptyLabel = '—',
  className,
  ...props
}: CurrencyTextProps) {
  const activeLocale = useLocale()
  const resolvedLocale = locale ?? activeLocale

  if (value === null || value === undefined) {
    return (
      <span className={cn('tnum text-muted-foreground', className)} {...props}>
        {emptyLabel}
      </span>
    )
  }

  const tone = value > 0 ? 'text-income' : value < 0 ? 'text-expense' : 'text-foreground'
  const amount = showSign ? Math.abs(value) : value

  return (
    <span className={cn('tnum inline-flex items-center gap-0.5', tone, className)} {...props}>
      {showSign && value > 0 && <ArrowUpRight className="size-[1em] shrink-0" />}
      {showSign && value < 0 && <ArrowDownRight className="size-[1em] shrink-0" />}
      {formatMoney(amount, resolvedLocale)}
    </span>
  )
}
