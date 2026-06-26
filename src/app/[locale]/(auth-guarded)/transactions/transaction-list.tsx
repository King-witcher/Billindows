'use client'

import { ReceiptText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { useNow } from '@/contexts/now/now-context'
import type { AbstractTransaction, CategoryRow } from '@/lib/database/types'
import { DayGroup } from './day-group'
import { TransactionCard } from './transaction-card'

interface Props {
  transactions: AbstractTransaction[]
  categories: CategoryRow[]
  /** Displayed month (1-12) and year, which may differ from the current date. */
  year: number
  month: number
  onEdit: (t: AbstractTransaction) => void
  onDelete: (t: AbstractTransaction) => void
  onEndRecurrence: (t: AbstractTransaction) => void
}

export function TransactionList({
  transactions,
  categories,
  year,
  month,
  onEdit,
  onDelete,
  onEndRecurrence,
}: Props) {
  const t = useTranslations('transactions')
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const now = useNow()

  const isCurrentMonth = year === now.year && month === now.month
  const monthInFuture = year > now.year || (year === now.year && month > now.month)

  const groupedByDay = useMemo(() => {
    const groups = Object.groupBy(transactions, (tx) => tx.date.day)
    return (Object.entries(groups) as [string, AbstractTransaction[]][]).sort(
      ([dayA], [dayB]) => Number(dayB) - Number(dayA),
    )
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 pt-8 text-muted-foreground">
        <ReceiptText className="size-12 opacity-40" />
        <div className="text-center">
          <p className="text-sm font-medium">{t('empty')}</p>
          <p className="text-xs">{t('emptyHint')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {groupedByDay.map(([day, ts]) => (
        <DayGroup
          key={day}
          day={Number(day)}
          year={year}
          month={month}
          isToday={year === now.year && month === now.month && Number(day) === now.day}
          subtotal={ts.reduce((sum, tx) => sum + tx.amount, 0)}
        >
          {ts.map((t) => {
            const category = categoryMap.get(t.category_id)
            if (!category) return null
            return (
              <TransactionCard
                key={t.id}
                transaction={t}
                category={category}
                isFuture={monthInFuture || (isCurrentMonth && t.date.day > now.day)}
                onEdit={onEdit}
                onDelete={onDelete}
                onEndRecurrence={onEndRecurrence}
              />
            )
          })}
        </DayGroup>
      ))}
    </div>
  )
}
