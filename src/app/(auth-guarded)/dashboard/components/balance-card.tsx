'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/utils'

type Props = {
  title: string
  value: number
  subtitle?: string
  icon?: ReactNode
  showProgress?: boolean
  progressValue?: number
  progressLabel?: string
  loading?: boolean
  variant?: 'default' | 'income' | 'expense' | 'neutral'
}

const variantStyles = {
  default: 'text-foreground',
  income: 'text-emerald-600 dark:text-emerald-400',
  expense: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  showProgress,
  progressValue,
  progressLabel,
  variant = 'default',
  loading,
}: Props) {
  const computedVariant = variant === 'default' ? (value >= 0 ? 'income' : 'expense') : variant

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading && <Skeleton className="w-full h-full" />}
        <div className={cn(loading && 'invisible')}>
          <div className={cn('text-2xl font-bold', variantStyles[computedVariant])}>
            {formatMoney(value)}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {showProgress && progressValue !== undefined && (
            <div className="mt-3">
              <Progress value={Math.min(Math.max(progressValue, 0), 100)} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progressValue.toFixed(1)}% {progressLabel}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
