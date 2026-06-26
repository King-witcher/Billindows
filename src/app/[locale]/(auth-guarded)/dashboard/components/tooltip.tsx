import type { TooltipContentProps } from 'recharts'
import { formatMoney } from '@/utils/utils'

export const CustomTooltip = ({ active, payload, label }: TooltipContentProps<number, string>) => {
  if (active && payload && payload.length) {
    // In PieChart, there's no label (no XAxis), so use entry.name as the header
    const heading = label || payload[0].name
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{heading}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
            {formatMoney((entry.value ?? 0) * 100)}
          </p>
        ))}
      </div>
    )
  }
  return null
}
