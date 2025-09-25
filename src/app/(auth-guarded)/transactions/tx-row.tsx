'use client'

import { TxDto } from '@/utils/queries/get-one-time-txs'
import { EventRepeat } from '@mui/icons-material'
import Delete from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Category } from '@prisma/client'
import { MouseEvent } from 'react'
import { TransactionBadge } from './components/transaction-badge'

interface Props {
  transaction: TxDto
  category: Category
  onEdit: (tx: TxDto) => void
  onDelete: (tx: TxDto) => void
}

export function TxRow({ transaction, category, onDelete, onEdit }: Props) {
  const blur = transaction.day > new Date().getDate()

  function handleClickDelete(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onDelete(transaction)
  }

  return (
    <TableRow
      hover={!blur}
      data-blur={blur}
      onClick={() => onEdit(transaction)}
      className="data-[blur=true]:opacity-50 relative cursor-pointer"
    >
      {/* Name */}
      <TableCell className="truncate max-w-[150px]">
        <Tooltip title={transaction.name}>
          <strong>{transaction.name}</strong>
        </Tooltip>
      </TableCell>

      {/* Category */}
      <TableCell align="center" className="max-w-[150px]">
        <div className="flex items-center justify-center gap-[10px]">
          <Tooltip title={category.name}>
            <TransactionBadge name={category.name} color={category.color} />
          </Tooltip>
        </div>
      </TableCell>

      {/* Value */}
      <TableCell align="center">
        <Typography
          fontWeight={500}
          className="truncate flex items-center justify-center gap-1"
          color={transaction.value < 0 ? 'error' : 'success'}
        >
          {transaction.type === 'fixed' && <EventRepeat fontSize="small" />}
          {`R$ ${Math.abs(transaction.value / 100).toFixed(2)}`}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell align="right" className="truncate">
        <Tooltip title="Delete">
          <IconButton onClick={handleClickDelete}>
            <Delete />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
