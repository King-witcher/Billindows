'use client'

import { Calendar, Repeat, Target, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/utils'

type BalanceCardProps = {
  title: string
  value: number
  subtitle?: string
  icon?: ReactNode
  showProgress?: boolean
  progressValue?: number
  variant?: 'default' | 'income' | 'expense' | 'neutral'
}

const variantStyles = {
  default: 'text-foreground',
  income: 'text-emerald-600 dark:text-emerald-400',
  expense: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground',
}

export function BalanceCard({
  title,
  value,
  subtitle,
  icon,
  showProgress,
  progressValue,
  variant = 'default',
}: BalanceCardProps) {
  const computedVariant = variant === 'default' ? (value >= 0 ? 'income' : 'expense') : variant

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', variantStyles[computedVariant])}>
          {formatMoney(value)}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {showProgress && progressValue !== undefined && (
          <div className="mt-3">
            <Progress value={Math.min(Math.max(progressValue, 0), 100)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progressValue.toFixed(1)}% of month
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type DashboardSummaryProps = {
  balance: number
  forecast: number
  fixed: number
  oneTime: number
  monthProgress: number
}

export function DashboardSummary({
  balance,
  forecast,
  fixed,
  oneTime,
  monthProgress,
}: DashboardSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <BalanceCard
        title="Current Balance"
        value={balance}
        subtitle="Month total so far"
        icon={<Wallet className="h-4 w-4" />}
        showProgress
        progressValue={monthProgress * 100}
      />
      <BalanceCard
        title="Forecast"
        value={forecast}
        subtitle="If the pace continues"
        icon={<Target className="h-4 w-4" />}
      />
      <BalanceCard
        title="Fixed Balance"
        value={fixed}
        subtitle="Recurring transactions"
        icon={<Repeat className="h-4 w-4" />}
        variant="neutral"
      />
      <BalanceCard
        title="One-time Balance"
        value={oneTime}
        subtitle="One-time transactions"
        icon={<Calendar className="h-4 w-4" />}
        variant="neutral"
      />
    </div>
  )
}
