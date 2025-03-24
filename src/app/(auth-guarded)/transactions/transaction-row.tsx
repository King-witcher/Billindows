'use client'

import { Delete, Edit } from '@mui/icons-material'
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material'

export interface ListedTransaction {
  id: number
  name: string
  category: {
    name: string
    color: string
  }
  value: number
  date: Date
}

interface Props {
  transaction: ListedTransaction
  onClickEdit: () => void
  onClickDelete: () => void
}

export function TransactionRow({
  transaction,
  onClickDelete,
  onClickEdit,
}: Props) {
  return (
    <TableRow hover>
      <TableCell>
        <div className="flex items-center gap-[10px]">
          <style jsx>{`
          .color-badge {
            width: 14px;
            height: 14px;
            border-radius: 999px;
            background: ${transaction.category.color};
          }
        `}</style>
          <div className="color-badge" />
          {transaction.name}
        </div>
      </TableCell>

      <TableCell align="center">
        {`R$ ${(transaction.value / 100).toFixed(2)}`}
      </TableCell>

      <TableCell align="center">
        <div className="flex items-center justify-center gap-[10px]">
          <style jsx>{`
          .color-badge {
            width: 14px;
            height: 14px;
            border-radius: 999px;
            background: ${transaction.category.color};
          }
        `}</style>
          <div className="color-badge" />
          {transaction.category.name}
        </div>
      </TableCell>

      <TableCell align="center">{transaction.date.toDateString()}</TableCell>

      <TableCell align="right">
        <Tooltip title="Edit">
          <IconButton onClick={onClickEdit}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={onClickDelete}>
            <Delete />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
