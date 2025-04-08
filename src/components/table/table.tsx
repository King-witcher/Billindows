'use client'

import Paper, { PaperProps } from '@mui/material/Paper'
import MUITable, { TableProps as MUITableProps } from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { TableCellProps } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow, { TableRowProps } from '@mui/material/TableRow'
import { FC, Key, ReactNode, Ref } from 'react'
import { twMerge } from 'tailwind-merge'
import { Row } from './row'

export type ColumnDefinition<TData> = {
  key: Key
  header: ReactNode
  /** Defines the data or key of the property to be rendered inside the cell. */
  content: keyof TData | FC<{ data: TData }>
  cellProps?: TableCellProps
}

export interface TableProps<TData> extends PaperProps {
  data: TData[]
  getKey: (row: TData) => Key
  columns: ColumnDefinition<TData>[]
  rowProps?: TableRowProps
  lastRowRef?: Ref<HTMLTableRowElement>
  tableProps?: Omit<MUITableProps, 'children'>
}

export function Table<TData>({
  data,
  getKey,
  columns,
  rowProps,
  tableProps,
  lastRowRef,
  children,
  className,
  ...paperProps
}: TableProps<TData>) {
  return (
    <Paper className={twMerge('overflow-hidden', className)} {...paperProps}>
      <TableContainer>
        <MUITable stickyHeader {...tableProps}>
          <TableHead>
            <TableRow>
              {columns.map((columnm) => {
                const { key, header, cellProps } = columnm
                return (
                  <TableCell key={key} {...cellProps}>
                    {header}
                  </TableCell>
                )
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, rowIndex) => {
              const rowKey = getKey(row)
              const isLastRow = rowIndex === data.length - 1
              return (
                <Row
                  key={rowKey}
                  ref={isLastRow ? lastRowRef : undefined}
                  data={row}
                  columns={columns}
                  {...rowProps}
                />
              )
            })}
          </TableBody>
        </MUITable>
        {children}
      </TableContainer>
    </Paper>
  )
}
