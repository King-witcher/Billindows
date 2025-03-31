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
import { ChangeEvent, useMemo, useState } from 'react'
import { CreateTransactionModal } from './modals/create-transaction'
import { DeleteTransactionDialog } from './modals/delete-transaction'
import { EditTransactionDialog } from './modals/edit-transaction'
import { TransactionRow } from './transaction-row'

interface Props {
  transactions: TxDto[]
  now: Date
}

export function ClientComponent({ transactions, now }: Props) {
  const [createTransactionModalOpen, setCreateTransactionModalOpen] =
    useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<TxDto | null>(
    null
  )
  const [transactionToEdit, setTransactionToEdit] = useState<TxDto | null>(null)

  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)

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
                  <TableCell className="!hidden sm:!table-cell">Date</TableCell>
                  <TableCell align="center">Transaction</TableCell>
                  <TableCell align="center">Category</TableCell>
                  <TableCell align="center">Value</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleTransactions.map((transaction) => (
                  <TransactionRow
                    onClickDelete={() => setTransactionToDelete(transaction)}
                    onClickEdit={() => setTransactionToEdit(transaction)}
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
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={transactions.length}
          onPageChange={(_, page: number) => setPage(page)}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
        />
      </Paper>

      <Modal
        open={createTransactionModalOpen}
        onClose={() => setCreateTransactionModalOpen(false)}
        className="max-w-full"
      >
        <CreateTransactionModal
          now={now}
          onClose={() => setCreateTransactionModalOpen(false)}
        />
      </Modal>
      <Modal
        open={Boolean(transactionToDelete)}
        onClose={() => setTransactionToDelete(null)}
        className="max-w-full"
      >
        {transactionToDelete ? (
          <DeleteTransactionDialog
            transaction={transactionToDelete}
            onSuccess={() => setTransactionToDelete(null)}
            onCancel={() => setTransactionToDelete(null)}
          />
        ) : (
          <></>
        )}
      </Modal>
      <Modal
        open={Boolean(transactionToEdit)}
        onClose={() => setTransactionToEdit(null)}
      >
        {transactionToEdit ? (
          <EditTransactionDialog onClose={() => setTransactionToEdit(null)} />
        ) : (
          <></>
        )}
      </Modal>
    </div>
  )
}
