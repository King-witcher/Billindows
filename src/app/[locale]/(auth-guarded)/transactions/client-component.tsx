'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useNow } from '@/contexts/now/now-context'
import { useUser } from '@/contexts/user-context'
import type { AbstractTransaction, CategoryRow } from '@/lib/database/types'
import { listTransactionsAction } from './actions'
import { DeleteTxForm } from './dialogs/delete-tx-form'
import { EndRecurrenceForm } from './dialogs/end-recurrence-form'
import { TxDialog } from './dialogs/tx-dialog'
import { TransactionList } from './transaction-list'
import { TransactionSummary } from './transaction-summary'
import { TransactionToolbar } from './transaction-toolbar'

interface Props {
  categories: CategoryRow[]
}

export function ClientComponent({ categories }: Props) {
  const user = useUser()
  const t = useTranslations('transactions')
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [deleteTxDialogOpen, setDeleteTxDialogOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<AbstractTransaction | null>(null)
  const [endRecurrenceOpen, setEndRecurrenceOpen] = useState(false)
  const [txToEnd, setTxToEnd] = useState<AbstractTransaction | null>(null)
  const [txToEdit, setTxToEdit] = useState<AbstractTransaction | undefined>()
  const [categoriesFilter, setCategoriesFilter] = useState<string[]>([])
  const [showFuture, setShowFuture] = useState(false)
  const [showFixed, setShowFixed] = useState(false)
  const [showOneTime, setShowOneTime] = useState(true)
  const [showForecasted, setShowForecasted] = useState(true)
  const [showNotForecasted, setShowNotForecasted] = useState(true)
  const [showIncome, setShowIncome] = useState(true)
  const [showExpenses, setShowExpenses] = useState(true)

  const now = useNow()

  const txQuery = useQuery({
    queryKey: ['transactions', user.email, now.month],
    queryFn: async () => listTransactionsAction({ filter: { year: now.year, month: now.month } }),
  })

  const filteredTransactions = useMemo(() => {
    return txQuery.data?.filter((tx) => {
      if (categoriesFilter.length > 0 && !categoriesFilter.includes(tx.category_id)) return false
      if (!showFuture && tx.date.day > now.day) return false
      if (!showFixed && tx.recurrence === 'fixed') return false
      if (!showOneTime && tx.recurrence === 'one-time') return false
      if (!showForecasted && tx.forecast) return false
      if (!showNotForecasted && !tx.forecast) return false
      if (!showIncome && tx.amount > 0) return false
      if (!showExpenses && tx.amount < 0) return false
      return true
    })
  }, [
    txQuery.data,
    categoriesFilter,
    showFuture,
    showFixed,
    showOneTime,
    showForecasted,
    showNotForecasted,
    showIncome,
    showExpenses,
    now.day,
  ])

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
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:h-full lg:flex-row lg:py-0">
      {/* Sidebar */}
      <div className="flex flex-col gap-4 lg:w-72 lg:py-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <TransactionToolbar
          categories={categories}
          categoriesFilter={categoriesFilter}
          onCategoriesFilterChange={setCategoriesFilter}
          showFuture={showFuture}
          onShowFutureChange={setShowFuture}
          showFixed={showFixed}
          onShowFixedChange={setShowFixed}
          showOneTime={showOneTime}
          onShowOneTimeChange={setShowOneTime}
          showForecasted={showForecasted}
          onShowForecastedChange={setShowForecasted}
          showNotForecasted={showNotForecasted}
          onShowNotForecastedChange={setShowNotForecasted}
          showIncome={showIncome}
          onShowIncomeChange={setShowIncome}
          showExpenses={showExpenses}
          onShowExpensesChange={setShowExpenses}
          onCreateClick={handleOpenCreateModal}
        />
        {filteredTransactions && (
          <TransactionSummary transactions={filteredTransactions} className="hidden sm:flex" />
        )}
      </div>

      <div className="lg:relative lg:-mr-6 lg:flex-1 lg:overflow-y-auto lg:pr-6">
        {filteredTransactions && (
          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            onEdit={handleClickEdit}
            onDelete={handleClickDelete}
            onEndRecurrence={handleClickEndRecurrence}
          />
        )}
      </div>

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
