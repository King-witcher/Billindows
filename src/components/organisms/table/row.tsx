import TableCell from '@mui/material/TableCell'
import TableRow, { TableRowProps } from '@mui/material/TableRow'
import { ReactNode } from 'react'
import { ColumnDefinition } from './table'

interface Props<TData> extends TableRowProps {
  data: TData
  columns: ColumnDefinition<TData>[]
}

export function Row<TData>({ data, columns, ...props }: Props<TData>) {
  return (
    <TableRow {...props}>
      {columns.map((columnm) => {
        const value =
          typeof columnm.content === 'function' ? (
            <columnm.content data={data} />
          ) : (
            (data[columnm.content] as ReactNode)
          )

        return (
          <TableCell key={columnm.key} {...columnm.cellProps}>
            {value}
          </TableCell>
        )
      })}
    </TableRow>
  )
}
