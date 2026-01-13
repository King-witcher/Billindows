'use client'

import AddIcon from '@mui/icons-material/Add'
import { Checkbox, ListItemText } from '@mui/material'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import type { Category } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { TxDto } from '@/utils/queries/get-one-time-txs'
import { getTransactions } from './actions'
import { DeleteTxDialog } from './modals/delete-tx'
import { TxDialog } from './modals/tx-dialog'
import { TxTable } from './tx-table'

interface Props {
  categories: Category[]
  now: Date
}

export function ClientComponent({ categories, now }: Props) {
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [deleteTxDialogOpen, setDeleteTxDialogOpen] = useState(false)
  const [txToDelete, setTxToDelete] = useState<TxDto | null>(null)
  const [txToEdit, setTxToEdit] = useState<TxDto | undefined>()
  const [categoriesFilter, setCategoriesFilter] = useState<number[]>([])
  const [includeFilter, setIncludeFilter] = useState<string[]>([])

  const txQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      return getTransactions(now)
    },
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: explained
  const filteredTransactions = useMemo(() => {
    let result = txQuery.data
    if (!result) return []

    // Filter by category
    if (categoriesFilter.length !== 0) {
      result = result.filter((transaction) => categoriesFilter.includes(transaction.category_id))
    }

    // Filter by future
    if (!includeFilter.includes('show-future')) {
      result = result.filter((transaction) => {
        return transaction.day <= now.getDate()
      })
    }

    // Filter by fixed
    if (!includeFilter.includes('show-fixed')) {
      result = result.filter((transaction) => transaction.type !== 'fixed')
    }

    return result
  }, [txQuery.data, categoriesFilter, includeFilter.join(',')])

  function handleChangeCategoriesFilter(e: SelectChangeEvent<number[]>) {
    const value = e.target.value as number[]
    setCategoriesFilter(value)
  }

  function handleChnageIncludeFilter(e: SelectChangeEvent<string[]>) {
    const value = e.target.value as string[]
    setIncludeFilter(value)
  }

  function handleOpenCreateModal() {
    setTxToEdit(undefined)
    setTxModalOpen(true)
  }

  function handleClickEdit(tx: TxDto) {
    setTxToEdit(tx)
    setTxModalOpen(true)
  }

  function onClickDelete(tx: TxDto) {
    setTxToDelete(tx)
    setDeleteTxDialogOpen(true)
  }

  return (
    <div className="p-[20px] flex flex-col gap-[20px] h-full">
      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-[20px] w-full ml-auto">
        <Typography className="self-start text-3xl! md:text-5xl!" variant="h3" color="primary">
          Transactions
        </Typography>
        <div className="flex items-center gap-[20px]">
          <Select
            size="small"
            value={includeFilter}
            displayEmpty
            multiple
            onChange={handleChnageIncludeFilter}
            renderValue={() => 'Include'}
          >
            <MenuItem value="show-future">
              <Checkbox size="small" checked={includeFilter.includes('show-future')} />
              <ListItemText primary="Future" />
            </MenuItem>
            <MenuItem value="show-fixed">
              <Checkbox size="small" checked={includeFilter.includes('show-fixed')} />
              <ListItemText primary="Fixed" />
            </MenuItem>
          </Select>
          <Select
            size="small"
            value={categoriesFilter}
            displayEmpty
            onChange={handleChangeCategoriesFilter}
            multiple
            renderValue={(selected) => {
              if (selected.length === 0) return 'All categories'
              if (selected.length === 1) {
                const category = categories.find((category) => category.id === selected[0])
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
            onClick={handleOpenCreateModal}
          >
            New transaction
          </Button>
        </div>
      </div>

      <TxTable
        transactions={filteredTransactions}
        categories={categories}
        onDeleteClick={onClickDelete}
        onEdit={handleClickEdit}
      />

      <TxDialog open={txModalOpen} onOpenChange={setTxModalOpen} txToEdit={txToEdit} />
      <Dialog open={deleteTxDialogOpen} onOpenChange={setDeleteTxDialogOpen}>
        <DialogContent>
          {txToDelete && (
            <DeleteTxDialog tx={txToDelete} onClose={() => setDeleteTxDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
