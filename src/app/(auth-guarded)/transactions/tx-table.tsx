'use client'

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material'
import { TxRow } from './tx-row'
import { TxDto } from '@/utils/queries/get-one-time-txs'
import { ChangeEvent, useMemo, useState } from 'react'
import { Category } from '@prisma/client'

interface Props {
  transactions: TxDto[]
  categories: Category[]
  onDelete: (tx: TxDto) => void
  onEdit: (tx: TxDto) => void
}

export function TxTable({ transactions, categories, onDelete, onEdit }: Props) {
  const [intendedPage, setIntendedPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const maxPage = Math.floor(transactions.length / pageSize)
  const page = Math.min(intendedPage, maxPage)

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  )

  const visibleTransactions = useMemo(
    () =>
      transactions
        .sort((a, b) => b.day - a.day)
        .slice(intendedPage * pageSize, intendedPage * pageSize + pageSize),
    [transactions, intendedPage, pageSize]
  )

  function handleChangeRowsPerPage(e: ChangeEvent<HTMLInputElement>) {
    setPageSize(+e.target.value)
    setIntendedPage(0)
  }

  return (
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
                  onDelete={onDelete}
                  onEdit={onEdit}
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
        onPageChange={(_, page: number) => setIntendedPage(page)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page}
      />
    </Paper>
  )
}
