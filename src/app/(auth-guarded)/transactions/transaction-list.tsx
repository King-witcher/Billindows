'use client'

import type { Category } from '@prisma/client'
import { ReceiptText } from 'lucide-react'
import { useMemo } from 'react'
import type { Transaction } from '@/database/repositories/transactions'
import { DayGroup } from './day-group'
import { TransactionCard } from './transaction-card'

interface Props {
  transactions: Transaction[]
  categories: Category[]
  now: Date
  onEdit: (tx: Transaction) => void
  onDelete: (tx: Transaction) => void
}

export function TransactionList({ transactions, categories, now, onEdit, onDelete }: Props) {
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const groupedByDay = useMemo(() => {
    const groups = Object.groupBy(transactions, (tx) => tx.day)
    return Object.entries(groups).sort(([dayA], [dayB]) => Number(dayB) - Number(dayA)) as [
      string,
      Transaction[],
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

  const today = now.getDate()
  const month = now.getMonth()
  const year = now.getFullYear()

  return (
    <div className="flex flex-col gap-4">
      {groupedByDay.map(([day, txs]) => (
        <DayGroup
          key={day}
          day={Number(day)}
          year={year}
          month={month}
          isToday={Number(day) === today}
        >
          {txs.map((tx) => {
            const category = categoryMap.get(tx.category_id)
            if (!category) return null
            return (
              <TransactionCard
                key={`${tx.type}-${tx.id}`}
                transaction={tx}
                category={category}
                isFuture={tx.day > today}
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
