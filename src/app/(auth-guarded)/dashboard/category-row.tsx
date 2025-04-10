'use client'

import { CurrencyText } from '@/components/atoms/currency-text'
import { TableCell, TableRow, Tooltip } from '@mui/material'

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
        <CurrencyText
          value={category.balance}
          variant="body2"
          className="truncate"
          fontWeight={500}
        />
      </TableCell>
      <TableCell align="center">
        <CurrencyText
          value={category.goal}
          variant="body2"
          className="truncate"
          fontWeight={500}
        />
      </TableCell>
      <TableCell align="right">
        <CurrencyText
          value={category.forecast}
          variant="body2"
          className="truncate"
          fontWeight={500}
        />
      </TableCell>
    </TableRow>
  )
}
