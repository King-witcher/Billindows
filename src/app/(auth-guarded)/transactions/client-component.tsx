'use client'

import { TxDto } from '@/utils/queries/get-one-time-txs'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Modal from '@mui/material/Modal'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { Category } from '@prisma/client'
import { ChangeEvent, useMemo, useState } from 'react'
import { createTxAction } from './actions/create-tx'
import { udpateTxAction } from './actions/update-tx'
import { DeleteTxDialog } from './modals/delete-tx'
import { TxDialog } from './modals/tx-dialog'
import { TxRow } from './tx-row'

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
  const [pageSize, setPageSize] = useState(10)

  const filteredTransactions = useMemo(() => {
    if (categoriesFilter.length === 0) return transactions
    return transactions.filter((transaction) =>
      categoriesFilter.includes(transaction.category_id)
    )
  }, [transactions, categoriesFilter])

  const [page, setPage] = useState(() => {
    const blurredTransactions = filteredTransactions.filter(
      (transaction) => transaction.day > now.getDate()
    ).length
    return Math.floor(blurredTransactions / pageSize)
  })

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  )

  const visibleTransactions = useMemo(
    () =>
      filteredTransactions
        .sort((a, b) => b.day - a.day)
        .slice(page * pageSize, page * pageSize + pageSize),
    [filteredTransactions, page, pageSize]
  )

  function handleChangeRowsPerPage(e: ChangeEvent<HTMLInputElement>) {
    setPageSize(+e.target.value)
    setPage(0)
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
            onChange={(e) => {
              console.log('setting', e.target.value)
              setCategoriesFilter(e.target.value as number[])
            }}
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

      <Paper className="flex-1 flex flex-col overflow-hidden">
        <TableContainer className="flex flex-col flex-1">
          <div className="flex-1 relative">
            <Table stickyHeader className="absolute inset-0">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Transaction</TableCell>
                  <TableCell align="center">Category</TableCell>
                  <TableCell align="center">Value</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleTransactions.map((transaction) => (
                  <TxRow
                    category={categoryMap.get(transaction.category_id)!}
                    onDelete={setTxToDelete}
                    onEdit={handleClickEdit}
                    key={`${transaction.type}-${transaction.id}`}
                    transaction={transaction}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
        <TablePagination
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 32, 100]}
          component="div"
          count={transactions.length}
          onPageChange={(_, page: number) => setPage(page)}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
        />
      </Paper>

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
