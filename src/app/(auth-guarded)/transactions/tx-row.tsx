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
import { Category } from '@prisma/client'

interface Props {
  transaction: TxDto
  category: Category
  onEdit: (tx: TxDto) => void
  onDelete: (tx: TxDto) => void
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function TxRow({ transaction, category, onDelete, onEdit }: Props) {
  const blur = transaction.day > new Date().getDate()
  const weekDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    transaction.day
  ).getDay()

  return (
    <TableRow
      hover={!blur}
      data-blur={blur}
      className="data-[blur=true]:opacity-50 relative"
    >
      {/* Date */}
      <TableCell className="flex gap-2 items-center">
        {transaction.day}{' '}
        <span className="opacity-60">{weekDays[weekDay]}</span>
      </TableCell>

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
            background: ${category.color};
          }
        `}</style>
          <div className="color-badge" />
          <Tooltip title={category.name}>
            <span className="truncate">{category.name}</span>
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
        <button
          type="button"
          aria-label="Edit"
          className="absolute inset-0 cursor-pointer hidden sm:block"
          onClick={() => onEdit(transaction)}
        />
        <Tooltip title="Delete" className="sm:!hidden">
          <IconButton onClick={() => onEdit(transaction)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={() => onDelete(transaction)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
