'use client'

import { ReceiptText } from 'lucide-react'
import { useMemo } from 'react'
import { useNow } from '@/contexts/now/now-context'
import type { AbstractTransaction, CategoryRow } from '@/lib/database/types'
import { DayGroup } from './day-group'
import { TransactionCard } from './transaction-card'

interface Props {
  transactions: AbstractTransaction[]
  categories: CategoryRow[]
  onEdit: (t: AbstractTransaction) => void
  onDelete: (t: AbstractTransaction) => void
}

export function TransactionList({ transactions, categories, onEdit, onDelete }: Props) {
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
  const now = useNow()

  const groupedByDay = useMemo(() => {
    const groups = Object.groupBy(transactions, (tx) => tx.date.day)
    return Object.entries(groups).sort(([dayA], [dayB]) => Number(dayB) - Number(dayA)) as [
      string,
      AbstractTransaction[],
    ][]
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <ReceiptText className="size-12 opacity-40" />
        <div className="text-center">
          <p className="text-sm font-medium">No transactions found</p>
          <p className="text-xs">Try adjusting your filters or create a new transaction.</p>
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
          year={now.year}
          month={now.month}
          isToday={Number(day) === now.day}
        >
          {ts.map((t) => {
            const category = categoryMap.get(t.category_id)
            if (!category) return null
            return (
              <TransactionCard
                key={t.id}
                transaction={t}
                category={category}
                isFuture={t.date.day > now.day}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )
          })}
        </DayGroup>
      ))}
    </div>
  )
}
