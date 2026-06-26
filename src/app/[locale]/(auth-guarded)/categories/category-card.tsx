'use client'

import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AbstractTransaction, CategoryRow } from '@/lib/database/types'

/** A category's activity within the current month. */
export type CategoryMonth = {
  /** Net balance in cents (income positive, expense negative). */
  balance: number
  /** Number of transactions this month. */
  count: number
  /** Transactions of the month, most recent first. */
  transactions: AbstractTransaction[]
}

type Props = {
  category: CategoryRow
  month: CategoryMonth | undefined
  loading: boolean
  onSelect: (category: CategoryRow) => void
}

export function CategoryCard({ category, month, loading, onSelect }: Props) {
  const t = useTranslations('categories')
  const balance = month?.balance ?? 0
  const count = month?.count ?? 0

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      aria-label={category.name}
      className="group block h-full w-full text-left focus-visible:outline-none"
    >
      <Card className="h-full transition group-hover:border-primary/40 group-hover:shadow-md group-focus-visible:border-primary/40 group-focus-visible:ring-2 group-focus-visible:ring-ring/40">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="truncate font-medium">{category.name}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{t('balanceInMonth')}</p>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-24" />
          ) : (
            <div className="mt-0.5 text-xl font-semibold">
              <CurrencyText value={balance} />
            </div>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            {loading ? ' ' : t('txCount', { count })}
          </p>
        </CardContent>
      </Card>
    </button>
  )
}
