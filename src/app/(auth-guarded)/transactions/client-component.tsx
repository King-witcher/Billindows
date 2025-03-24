'use client'

// import { Button } from '@/components/atoms/button/button'
import {
  Button,
  Typography,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Table,
  TableBody,
  Paper,
  TablePagination,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { ChangeEvent, useMemo, useState } from 'react'
import { ListedTransaction, TransactionRow } from './transaction-row'

interface Props {
  transactions: ListedTransaction[]
}

export function ClientComponent({ transactions }: Props) {
  const [createTransactionModalOpen, setCreateTransactionModalOpen] =
    useState(false)
  const [transactionToDelete, setTransactionToDelete] =
    useState<ListedTransaction | null>(null)
  const [transactionToEdit, setTransactionToEdit] =
    useState<ListedTransaction | null>(null)

  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)

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

  return (
    <div className="p-[20px] flex flex-col gap-[20px] h-full">
      <div className="flex items-center justify-between">
        <Typography variant="h2" color="primary">
          Transactions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setCreateTransactionModalOpen(true)}
        >
          Add transaction
        </Button>
      </div>

      <Paper className="flex-1 flex flex-col overflow-hidden">
        <TableContainer className="flex flex-col flex-1">
          <div className="flex-1 relative">
            <Table stickyHeader className="absolute inset-0">
              <TableHead>
                <TableRow>
                  <TableCell>Transaction</TableCell>
                  <TableCell align="center">Value</TableCell>
                  <TableCell align="center">Category</TableCell>
                  <TableCell align="center">Date</TableCell>
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
    </div>
  )
}
