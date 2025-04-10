'use client'

import { TxDto } from '@/utils/queries/get-one-time-txs'
import { EventRepeat } from '@mui/icons-material'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

interface Props {
  transaction: TxDto
  onClickEdit: () => void
  onClickDelete: () => void
}

export function TransactionRow({
  transaction,
  onClickDelete,
  onClickEdit,
}: Props) {
  const blur = transaction.day > new Date().getDate()

  return (
    <TableRow hover={!blur} className={blur ? 'opacity-50' : ''}>
      {/* Date */}
      <TableCell>{transaction.day}</TableCell>

      {/* Name */}
      <TableCell align="center" className="truncate max-w-[150px]">
        <Tooltip title={transaction.name}>
          <span>{transaction.name}</span>
        </Tooltip>
      </TableCell>

      {/* Category */}
      <TableCell align="center" className="max-w-[150px]">
        <div className="flex items-center justify-center gap-[10px]">
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
          <Tooltip title={transaction.category.name}>
            <span className="truncate">{transaction.category.name}</span>
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
