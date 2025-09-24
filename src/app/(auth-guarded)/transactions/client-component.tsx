'use client'

import { TxDto } from '@/utils/queries/get-one-time-txs'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Modal from '@mui/material/Modal'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { Category } from '@prisma/client'
import { useMemo, useState } from 'react'
import { createTxAction } from './actions/create-tx'
import { udpateTxAction } from './actions/update-tx'
import { DeleteTxDialog } from './modals/delete-tx'
import { TxDialog } from './modals/tx-dialog'
import { TxTable } from './tx-table'

interface Props {
  transactions: TxDto[]
  categories: Category[]
  now: Date
}

export function ClientComponent({ transactions, categories, now }: Props) {
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<TxDto | undefined>()
  const [txToEdit, setTxToEdit] = useState<TxDto | undefined>()
  const [categoriesFilter, setCategoriesFilter] = useState<number[]>([])

  const filteredTransactions = useMemo(() => {
    if (categoriesFilter.length === 0) return transactions
    return transactions.filter((transaction) =>
      categoriesFilter.includes(transaction.category_id)
    )
  }, [transactions, categoriesFilter])

  function handleChangeCategoriesFilter(e: SelectChangeEvent<number[]>) {
    const value = e.target.value as number[]
    setCategoriesFilter(value)
  }

  function handleClose() {
    setTxModalOpen(false)
    setTxToDelete(undefined)
    setTxToEdit(undefined)
  }

  function handleClickEdit(tx: TxDto) {
    setTxToEdit(tx)
    setTxModalOpen(true)
  }

  const txAction = txToEdit ? udpateTxAction : createTxAction

  return (
    <div className="p-[20px] flex flex-col gap-[20px] h-full">
      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-[20px] w-full ml-auto">
        <Typography className="self-start" variant="h3" color="primary">
          Transactions
        </Typography>
        <div className="flex items-center gap-[20px]">
          <Select
            size="small"
            value={categoriesFilter}
            displayEmpty
            onChange={handleChangeCategoriesFilter}
            multiple
            renderValue={(selected) => {
              console.log('rendering this')
              if (selected.length === 0) return 'All categories'
              if (selected.length === 1) {
                const category = categories.find(
                  (category) => category.id === selected[0]
                )
                return category ? category.name : ''
              }
              return `${selected.length} categories`
            }}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setTxModalOpen(true)}
          >
            New transaction
          </Button>
        </div>
      </div>

      <TxTable
        transactions={filteredTransactions}
        categories={categories}
        onDelete={setTxToDelete}
        onEdit={handleClickEdit}
      />

      <Modal open={txModalOpen} onClose={handleClose} className="max-w-full">
        <TxDialog
          now={now}
          categories={categories}
          action={txAction}
          onClose={handleClose}
          tx={txToEdit}
        />
      </Modal>
      <Modal
        open={Boolean(txToDelete)}
        onClose={handleClose}
        className="max-w-full"
      >
        {txToDelete ? (
          <DeleteTxDialog
            transaction={txToDelete}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        ) : (
          <></>
        )}
      </Modal>
    </div>
  )
}
