'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useNow } from '@/contexts/now/now-context'
import { useTransactions } from '@/hooks/use-transaction/use-transactions'
import type { AbstractTransaction, CategoryRow } from '@/lib/database/types'
import { DeleteTxForm } from './dialogs/delete-tx-form'
import { EndRecurrenceForm } from './dialogs/end-recurrence-form'
import { TxDialog } from './dialogs/tx-dialog'
import { MonthSelector } from './month-selector'
import { TransactionList } from './transaction-list'
import { TransactionSummary } from './transaction-summary'
import { DEFAULT_FILTERS, type Filters, TransactionsFilters } from './transactions-filters'

interface Props {
  categories: CategoryRow[]
}

export function ClientComponent({ categories }: Props) {
  const t = useTranslations('transactions')
  const now = useNow()

  const [view, setView] = useState(() => ({ year: now.year, month: now.month }))
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const [txModalOpen, setTxModalOpen] = useState(false)
  const [txToEdit, setTxToEdit] = useState<AbstractTransaction | undefined>()
  const [deleteTxDialogOpen, setDeleteTxDialogOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<AbstractTransaction | null>(null)
  const [endRecurrenceOpen, setEndRecurrenceOpen] = useState(false)
  const [txToEnd, setTxToEnd] = useState<AbstractTransaction | null>(null)

  const txQuery = useTransactions(view.year, view.month)
  const loading = txQuery.isLoading
  const monthTransactions = useMemo(() => txQuery.data ?? [], [txQuery.data])

  const isCurrentMonth = view.year === now.year && view.month === now.month
  const monthInFuture = view.year > now.year || (view.year === now.year && view.month > now.month)

  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return monthTransactions.filter((tx) => {
      if (term && !tx.name.toLowerCase().includes(term)) return false
      if (filters.type === 'income' && tx.amount < 0) return false
      if (filters.type === 'expense' && tx.amount > 0) return false
      if (!filters.showFixed && tx.recurrence === 'fixed') return false
      if (!filters.showOneTime && tx.recurrence === 'one-time') return false
      if (!filters.showInForecast && tx.forecast) return false
      if (!filters.showOutForecast && !tx.forecast) return false
      const txIsFuture = monthInFuture || (isCurrentMonth && tx.date.day > now.day)
      if (!filters.showFuture && txIsFuture) return false
      if (filters.categories.length > 0 && !filters.categories.includes(tx.category_id))
        return false
      return true
    })
  }, [monthTransactions, search, filters, isCurrentMonth, monthInFuture, now.day])

  function prevMonth() {
    setView((v) => (v.month === 1 ? { year: v.year - 1, month: 12 } : { ...v, month: v.month - 1 }))
  }
  function nextMonth() {
    setView((v) => (v.month === 12 ? { year: v.year + 1, month: 1 } : { ...v, month: v.month + 1 }))
  }
  function goToday() {
    setView({ year: now.year, month: now.month })
  }

  function handleOpenCreateModal() {
    setTxToEdit(undefined)
    setTxModalOpen(true)
  }
  function handleClickEdit(tx: AbstractTransaction) {
    setTxToEdit(tx)
    setTxModalOpen(true)
  }
  function handleClickDelete(tx: AbstractTransaction) {
    setTxToDelete(tx)
    setDeleteTxDialogOpen(true)
  }
  function handleClickEndRecurrence(tx: AbstractTransaction) {
    setTxToEnd(tx)
    setEndRecurrenceOpen(true)
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <MonthSelector
            year={view.year}
            month={view.month}
            isCurrentMonth={isCurrentMonth}
            onPrev={prevMonth}
            onNext={nextMonth}
            onToday={goToday}
          />
        </div>
        <Button onClick={handleOpenCreateModal} className="shrink-0">
          <Plus /> {t('newTransaction')}
        </Button>
      </div>

      <TransactionSummary transactions={monthTransactions} loading={loading} />

      <TransactionsFilters
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {loading ? (
        <ListSkeleton />
      ) : (
        <TransactionList
          transactions={filteredTransactions}
          categories={categories}
          year={view.year}
          month={view.month}
          onEdit={handleClickEdit}
          onDelete={handleClickDelete}
          onEndRecurrence={handleClickEndRecurrence}
        />
      )}

      {/* Dialogs */}
      <TxDialog open={txModalOpen} onOpenChange={setTxModalOpen} txToEdit={txToEdit} />
      <Dialog open={deleteTxDialogOpen} onOpenChange={setDeleteTxDialogOpen}>
        <DialogContent>
          {txToDelete && (
            <DeleteTxForm transaction={txToDelete} onClose={() => setDeleteTxDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={endRecurrenceOpen} onOpenChange={setEndRecurrenceOpen}>
        <DialogContent>
          {txToEnd && (
            <EndRecurrenceForm transaction={txToEnd} onClose={() => setEndRecurrenceOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 py-1.5">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  )
}
