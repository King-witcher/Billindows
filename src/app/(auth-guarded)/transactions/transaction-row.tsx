'use client'

import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import {
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'

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
      {/* Date */}
      <TableCell className="!hidden sm:!table-cell">
        {transaction.date.getMonth() + 1}/{transaction.date.getDate()}/
        {transaction.date.getFullYear()}
      </TableCell>

      {/* Name */}
      <TableCell align="center" className="truncate">
        {transaction.name}
      </TableCell>

      {/* Category */}
      <TableCell align="center">
        <div className="flex items-center justify-center gap-[10px] truncate">
          <style jsx>{`
          .color-badge {
            width: 14px;
            flex-shrink: 0;
            height: 14px;
            border-radius: 999px;
            background: ${transaction.category.color};
          }
        `}</style>
          <div className="color-badge" />
          {transaction.category.name}
        </div>
      </TableCell>

      {/* Value */}
      <TableCell align="center">
        <Typography
          fontWeight={500}
          className="truncate"
          color={transaction.value < 0 ? 'error' : 'success'}
        >
          {`R$ ${Math.abs(transaction.value / 100).toFixed(2)}`}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell align="right" className="truncate">
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
