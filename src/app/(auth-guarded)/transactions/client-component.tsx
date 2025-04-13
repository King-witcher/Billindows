'use client'

import { TxDto } from '@/utils/queries/get-one-time-txs'
import { Add } from '@mui/icons-material'
import {
  Button,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material'
import { Category } from '@prisma/client'
import { ChangeEvent, useMemo, useState } from 'react'
import { createTxAction } from './actions/create-transaction'
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

  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(() => {
    const blurredTransactions = transactions.filter(
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
      transactions
        .sort((a, b) => b.day - a.day)
        .slice(page * pageSize, page * pageSize + pageSize),
    [transactions, page, pageSize]
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setTxModalOpen(true)}
        >
          New transaction
        </Button>
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
