'use client'

import { TableCell, TableRow, Tooltip } from '@mui/material'
import { Badge } from '@/components/atoms/badge'
import { CurrencyText } from '@/components/atoms/currency-text'

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
  const currentProgress = (() => {
    if (max === 0) return 0
    const abs = Math.abs(category.balance)
    return (abs / max) * 100
  })()

  const forecastProgress = (() => {
    if (max === 0) return 0
    const abs = Math.abs(category.forecast)
    return (abs / max) * 100
  })()

  return (
    <TableRow hover className="relative">
      <TableCell>
        <div
          className="absolute h-full top-0 left-0 opacity-10 hidden sm:block pointer-events-none"
          style={{
            backgroundColor: category.balance >= 0 ? 'green' : 'red',
            width: `${currentProgress}%`,
          }}
        />
        <div
          className="absolute h-full top-0 left-0 opacity-10 hidden sm:block pointer-events-none"
          style={{
            backgroundColor: category.balance >= 0 ? 'green' : 'red',
            width: `${forecastProgress}%`,
          }}
        />

        <div className="flex items-center min-w-0 gap-[10px] max-w-[200px] sm:max-w-[300px]">
          <Tooltip title={category.name}>
            <Badge color={category.color}>{category.name}</Badge>
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
      <TableCell align="center" className="hidden! md:table-cell!">
        <CurrencyText value={category.goal} variant="body2" className="truncate" fontWeight={500} />
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
