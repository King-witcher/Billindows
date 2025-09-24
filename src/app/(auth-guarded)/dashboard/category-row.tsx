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
  max: number
}

export function CategoryRow({ category, max }: Props) {
  const progress = (() => {
    if (max === 0) return 0
    const abs = Math.abs(category.balance)
    return (abs / max) * 100
  })()

  return (
    <TableRow hover className="relative">
      <TableCell>
        <div
          className="absolute h-full top-0 left-0 opacity-10 hidden sm:visible"
          style={{
            backgroundColor: category.balance >= 0 ? 'green' : 'red',
            width: `${progress}%`,
          }}
        />
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
