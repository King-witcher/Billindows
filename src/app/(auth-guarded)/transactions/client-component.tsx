'use client'

import { CreateTransactionModal } from '@/components/organisms/modals/create-transaction/create-transaction'
import { Add } from '@mui/icons-material'
import {
  Button,
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
import React, { ChangeEvent, useMemo, useState } from 'react'
import { ListedTransaction, TransactionRow } from './transaction-row'

interface Props {
  transactions: ListedTransaction[]
  now: Date
}

export function ClientComponent({ transactions, now }: Props) {
  const [createTransactionModalOpen, setCreateTransactionModalOpen] =
    useState(false)
  const [transactionToDelete, setTransactionToDelete] =
    useState<ListedTransaction | null>(null)
  const [transactionToEdit, setTransactionToEdit] =
    useState<ListedTransaction | null>(null)

  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const visibleTransactions = useMemo(
    () =>
      transactions
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(page * pageSize, page * pageSize + pageSize),
    [transactions, page, pageSize]
  )

  function handleChangeRowsPerPage(e: ChangeEvent<HTMLInputElement>) {
    setPageSize(+e.target.value)
    setPage(0)
  }

  function handleClickAddTransaction(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <div className="p-[20px] flex flex-col gap-[20px] h-full">
      <div className="flex items-center gap-[10px] w-full ml-auto">
        <Typography variant="h2" color="primary">
          Transactions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          sx={{ marginLeft: 'auto' }}
          onClick={() => setCreateTransactionModalOpen(true)}
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleTransactions.map((transaction) => (
                  <TransactionRow
                    onClickDelete={() => setTransactionToDelete(transaction)}
                    onClickEdit={() => setTransactionToEdit(transaction)}
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
        <TablePagination
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={transactions.length}
          onPageChange={(_, page: number) => setPage(page)}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
        />
      </Paper>
      <CreateTransactionModal
        now={now}
        open={createTransactionModalOpen}
        onClose={() => setCreateTransactionModalOpen(false)}
      />
    </div>
  )
}
