'use client'

import type { Category } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Transaction } from '@/database/repositories/transactions'
import { listTxs } from './actions'
import { DeleteTxForm } from './modals/delete-tx-form'
import { TxDialog } from './modals/tx-dialog'
import { TransactionList } from './transaction-list'
import { TransactionSummary } from './transaction-summary'
import { TransactionToolbar } from './transaction-toolbar'

interface Props {
  categories: Category[]
  now: Date
}

export function ClientComponent({ categories, now }: Props) {
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [deleteTxDialogOpen, setDeleteTxDialogOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null)
  const [txToEdit, setTxToEdit] = useState<Transaction | undefined>()
  const [categoriesFilter, setCategoriesFilter] = useState<number[]>([])
  const [showFuture, setShowFuture] = useState(false)
  const [showFixed, setShowFixed] = useState(false)

  const txQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      return listTxs({ now })
    },
  })

  const filteredTransactions = useMemo(() => {
    let result = txQuery.data
    if (!result) return []

    if (categoriesFilter.length !== 0) {
      result = result.filter((tx) => categoriesFilter.includes(tx.category_id))
    }

    if (!showFuture) {
      result = result.filter((tx) => tx.day <= now.getDate())
    }

    if (!showFixed) {
      result = result.filter((tx) => tx.type !== 'fixed')
    }

    return result
  }, [txQuery.data, categoriesFilter, showFuture, showFixed, now])

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
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
        <TransactionSummary transactions={filteredTransactions} />
        <TransactionToolbar
          categories={categories}
          categoriesFilter={categoriesFilter}
          onCategoriesFilterChange={setCategoriesFilter}
          showFuture={showFuture}
          onShowFutureChange={setShowFuture}
          showFixed={showFixed}
          onShowFixedChange={setShowFixed}
          onCreateClick={handleOpenCreateModal}
        />
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto -mx-4 px-4 sm:-mx-6 sm:px-6">
        <TransactionList
          transactions={filteredTransactions}
          categories={categories}
          now={now}
          onEdit={handleClickEdit}
          onDelete={handleClickDelete}
        />
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
