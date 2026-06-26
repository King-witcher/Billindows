'use client'

import { useLocale } from 'next-intl'
import type { TooltipContentProps } from 'recharts'
import { formatMoney } from '@/utils/utils'

export function CustomTooltip({ active, payload, label }: TooltipContentProps<number, string>) {
  const locale = useLocale()

  if (active && payload && payload.length) {
    // In PieChart there's no axis label, so fall back to the entry name.
    const heading = label || payload[0].name
    return (
      <div className="rounded-lg border bg-popover p-3 shadow-md">
        <p className="mb-1 text-sm font-medium text-popover-foreground">{heading}</p>
        {payload.map((entry) => (
          <p
            key={entry.dataKey}
            className="tnum text-sm font-medium"
            style={{ color: entry.color }}
          >
            {formatMoney((entry.value ?? 0) * 100, locale)}
          </p>
        ))}
      </div>
    )
  }
  return null
}
