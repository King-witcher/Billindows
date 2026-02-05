import type { Category } from '@prisma/client'
import type { TxDto } from '@/utils/queries/get-one-time-txs'
import type { ChartData } from './components/types'

export type GroupAnalysis = {
  /** Total balance of transactions. */
  actualBalance: number

  /** Fixed transactions balance. */
  fixedBalance: number

  /** One-time transactions balance. */
  oneTimeBalance: number

  /** Forecasted transactions balance. */
  forecastBalance: number

  /** Progress towards the goal. */
  progress: number | null
}

export type CategoryAnalysis = GroupAnalysis & {
  category: Category
}

/**
 * Analyzes a group of transactions and calculates the fixed, one-time, and forecasted balances.
 * @param transactions
 * @param periodProgress The progress of the current period, represented as a decimal value between 0 and 1.
 * @param goal
 * @returns
 */
export function analyze(
  transactions: TxDto[],
  periodProgress: number,
  goal: number | null,
): GroupAnalysis {
  const fixed = transactions
    .filter((tx) => tx.type === 'fixed')
    .reduce((prev, current) => prev + current.value, 0)

  const oneTime = transactions
    .filter((tx) => tx.type === 'one-time')
    .reduce((prev, current) => prev + current.value, 0)

  const forecastable = transactions
    .filter((tx) => tx.forecast)
    .reduce((prev, current) => prev + current.value, 0)

  const rate = forecastable / periodProgress
  const forecast = fixed + oneTime + rate * (1 - periodProgress)

  return {
    actualBalance: fixed + oneTime,
    fixedBalance: fixed,
    oneTimeBalance: oneTime,
    forecastBalance: forecast,
    progress: goal ? (fixed + oneTime) / goal : null,
  }
}

/**
 * Analyzes transactions grouped by category
 * @param transactions All transactions for the period
 * @param categories All categories
 * @param periodProgress The progress of the current period (0-1)
 * @returns Analysis for each category
 */
export function analyzeByCategory(
  transactions: TxDto[],
  categories: Category[],
  periodProgress: number,
): CategoryAnalysis[] {
  return categories.map((category) => {
    const categoryTxs = transactions.filter((tx) => tx.category_id === category.id)
    const analysis = analyze(categoryTxs, periodProgress, category.goal)

    return {
      category,
      ...analysis,
    }
  })
}

export type DashboardData = {
  /** Current balance (income - expenses) */
  actualBalance: number
  /** Fixed transactions balance */
  fixedBalance: number
  /** One-time transactions balance */
  oneTimeBalance: number
  /** Forecasted balance if current rate continues */
  forecastBalance: number
  /** Progress through the month (current / total days) */
  monthProgress: number
  /** Analysis broken down by category */
  byCategory: CategoryAnalysis[]
}

/**
 * Process all data for the dashboard
 */
export function processDashboardData(
  fixed: TxDto[],
  oneTime: TxDto[],
  categories: Category[],
  monthProgress: number,
): DashboardData {
  const allTransactions = [...fixed, ...oneTime]
  const overall = analyze(allTransactions, monthProgress, null)
  const byCategory = analyzeByCategory(allTransactions, categories, monthProgress)

  return {
    actualBalance: overall.actualBalance,
    fixedBalance: overall.fixedBalance,
    oneTimeBalance: overall.oneTimeBalance,
    forecastBalance: overall.forecastBalance,
    monthProgress: monthProgress,
    byCategory,
  }
}

export type TransactionType = 'expenses' | 'income'
export type BalanceType = 'actual' | 'forecast'

/** Filter and prepare chart data based on transaction and balance types */
export function prepareChartData(
  categories: CategoryAnalysis[],
  transactionType: TransactionType,
  balanceType: BalanceType,
): ChartData[] {
  const filtered = categories.filter((cat) => {
    const value = balanceType === 'actual' ? cat.actualBalance : cat.forecastBalance
    if (transactionType === 'income') return value > 0
    return value < 0
  })

  return filtered
    .map((cat) => {
      const value = balanceType === 'actual' ? cat.actualBalance : cat.forecastBalance
      return {
        name: cat.category.name,
        value: Math.abs(value) / 100,
        fill: cat.category.color,
      }
    })
    .sort((a, b) => b.value - a.value)
}
