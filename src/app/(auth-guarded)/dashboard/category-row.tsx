'use client'

import { formatMoney } from '@/utils/utils'
import { TableCell, TableRow, Tooltip, Typography } from '@mui/material'

export type DashboardCategory = {
  id: number
  name: string
  color: string
  balance: number
  goal: number | null
  forecast: number
}

interface Props {
  category: DashboardCategory
}

export function CategoryRow({ category }: Props) {
  return (
    <TableRow hover>
      <TableCell>
        <div className="flex items-center min-w-0 gap-[10px] max-w-[200px] sm:max-w-[300px]">
          <style jsx>{`
            .color-badge {
              width: 14px;
              height: 14px;
              border-radius: 999px;
              flex-shrink: 0;
              background: ${category.color};
            }
          `}</style>
          <div className="color-badge" />
          <Tooltip title={category.name}>
            <span className="truncate">{category.name}</span>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell align="center">
        <Typography
          fontWeight={500}
          className="truncate"
          color={category.balance < 0 ? 'error' : 'success'}
          variant="body2"
        >
          {formatMoney(category.balance)}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Typography
          fontWeight={500}
          className="truncate"
          color={
            category.goal
              ? category.goal < 0
                ? 'error'
                : 'success'
              : 'textPrimary'
          }
          variant="body2"
        >
          {category.goal ? formatMoney(category.goal) : '-'}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography
          fontWeight={500}
          color={category.forecast < 0 ? 'error' : 'success'}
          className="truncate"
          variant="body2"
        >
          {formatMoney(category.forecast)}
        </Typography>
      </TableCell>
    </TableRow>
  )
}
