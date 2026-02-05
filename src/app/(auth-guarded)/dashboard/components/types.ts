import type { TxDto } from '@/utils/queries/get-one-time-txs'
import type { CategoryAnalysis } from '../helpers'

export type DashboardData = {
  /** Current balance (income - expenses) */
  balance: number
  /** Fixed transactions balance */
  fixed: number
  /** One-time transactions balance */
  oneTime: number
  /** Forecasted balance if current rate continues */
  forecast: number
  /** Progress through the month (0-1) */
  monthProgress: number
  /** Analysis broken down by category */
  byCategory: CategoryAnalysis[]
}

export type TransactionGroup = {
  transactions: TxDto[]
  periodProgress: number
  goal: number | null
}

export type ChartData = {
  name: string
  value: number
  fill: string
}
