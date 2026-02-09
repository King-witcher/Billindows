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
import type { Category } from '@prisma/client'
import { type ChangeEvent, Fragment, useMemo, useState } from 'react'
import type { Transaction } from '@/database'
import { TxRow } from './tx-row'

interface Props {
  transactions: Transaction[]
  categories: Category[]
  onDeleteClick: (tx: Transaction) => void
  onEdit: (tx: Transaction) => void
}
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function TxTable({ transactions, categories, onDeleteClick: onDelete, onEdit }: Props) {
  const [intendedPage, setIntendedPage] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  const maxPage = Math.floor(transactions.length / pageSize)
  const page = Math.min(intendedPage, maxPage)

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  )

  const visibleTransactions = useMemo(
    () =>
      transactions.sort((a, b) => b.day - a.day).slice(page * pageSize, page * pageSize + pageSize),
    [transactions, page, pageSize],
  )

  function handleChangeRowsPerPage(e: ChangeEvent<HTMLInputElement>) {
    setPageSize(+e.target.value)
    setIntendedPage(0)
  }

  return (
    <Paper className="flex-1 flex flex-col overflow-hidden">
      <TableContainer className="flex flex-col flex-1">
        <div className="flex-1 relative">
          <Table stickyHeader className="absolute inset-0" size="small">
            <TableHead>
              <TableRow>
                <TableCell className="py-3!">Transaction</TableCell>
                <TableCell align="center">Category</TableCell>
                <TableCell align="center">Value</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleTransactions.map((transaction, index) => {
                const prev = visibleTransactions[index - 1]
                const newDate = !prev || prev.day !== transaction.day
                const weekDay = new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  transaction.day,
                ).getDay()
                return (
                  <Fragment key={`${transaction.type}-${transaction.id}`}>
                    {newDate && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-2 bg-gray-100">
                          <div className="flex flex-col items-center w-full leading-5">
                            <span className="text-lg font-semibold">Day {transaction.day}</span>
                            <span className="opacity-60 text-xs leading-3">
                              {weekDays[weekDay]}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TxRow
                      category={categoryMap.get(transaction.category_id)!}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      transaction={transaction}
                    />
                  </Fragment>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </TableContainer>
      <TablePagination
        rowsPerPage={pageSize}
        rowsPerPageOptions={[15, 32, 100]}
        component="div"
        count={transactions.length}
        onPageChange={(_, page: number) => setIntendedPage(page)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        page={page}
      />
    </Paper>
  )
}
