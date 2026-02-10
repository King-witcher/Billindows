'use client'

import type { Category } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUser } from '@/contexts/user-context'
import type { Transaction } from '@/database/repositories/transactions'
import { listTxs } from './actions'
import { DeleteTxForm } from './dialogs/delete-tx-form'
import { TxDialog } from './dialogs/tx-dialog'
import { TransactionList } from './transaction-list'
import { TransactionSummary } from './transaction-summary'
import { TransactionToolbar } from './transaction-toolbar'

interface Props {
  categories: Category[]
  now: Date
}

export function ClientComponent({ categories, now }: Props) {
  const user = useUser()
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [deleteTxDialogOpen, setDeleteTxDialogOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null)
  const [txToEdit, setTxToEdit] = useState<Transaction | undefined>()
  const [categoriesFilter, setCategoriesFilter] = useState<number[]>([])
  const [showFuture, setShowFuture] = useState(false)
  const [showFixed, setShowFixed] = useState(false)
  const [showOneTime, setShowOneTime] = useState(true)
  const [showForecasted, setShowForecasted] = useState(true)
  const [showNotForecasted, setShowNotForecasted] = useState(true)
  const [showIncome, setShowIncome] = useState(true)
  const [showExpenses, setShowExpenses] = useState(true)

  const txQuery = useQuery({
    queryKey: ['transactions', user.email],
    queryFn: async () => {
      return listTxs({ now })
    },
  })

  const filteredTransactions = useMemo(() => {
    const result = txQuery.data?.filter((tx) => {
      if (categoriesFilter.length > 0 && !categoriesFilter.includes(tx.category_id)) return false
      if (!showFuture && tx.day > now.getDate()) return false

      if (!showFixed && tx.type === 'fixed') return false
      if (!showOneTime && tx.type === 'one-time') return false

      if (!showForecasted && tx.forecast) return false
      if (!showNotForecasted && !tx.forecast) return false

      if (!showIncome && tx.value > 0) return false
      if (!showExpenses && tx.value < 0) return false
      return true
    })
    return result
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
    now,
  ])

  function handleOpenCreateModal() {
    setTxToEdit(undefined)
    setTxModalOpen(true)
  }

  function handleClickEdit(tx: Transaction) {
    setTxToEdit(tx)
    setTxModalOpen(true)
  }

  function handleClickDelete(tx: Transaction) {
    setTxToDelete(tx)
    setDeleteTxDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:py-0 lg:flex-row lg:h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:py-6 lg:w-72">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
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

      <div className="lg:flex-1 lg:-mr-6 lg:pr-6 lg:overflow-y-auto lg:relative">
        {/* Transaction list */}
        {filteredTransactions && (
          <TransactionList
            transactions={filteredTransactions}
            categories={categories}
            now={now}
            onEdit={handleClickEdit}
            onDelete={handleClickDelete}
          />
        )}
      </div>

      {/* Dialogs */}
      <TxDialog open={txModalOpen} onOpenChange={setTxModalOpen} txToEdit={txToEdit} />
      <Dialog open={deleteTxDialogOpen} onOpenChange={setDeleteTxDialogOpen}>
        <DialogContent>
          {txToDelete && (
            <DeleteTxForm tx={txToDelete} onClose={() => setDeleteTxDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
