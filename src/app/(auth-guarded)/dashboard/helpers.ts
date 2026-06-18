import type { AbstractTransaction } from '@/lib/database/types'

export type TarnsactionsSummary = {
  totalIncome: number
  totalExpenses: number

  oneTimeIncome: number
  oneTimeExpenses: number

  fixedIncome: number
  fixedExpenses: number

  forecastable: number
}

export type TransactionType = 'expenses' | 'income'
export type BalanceType = 'actual' | 'forecast'

/**
 * Analyzes a group of transactions and calculates the fixed, one-time, and forecasted balances.
 * @param transactions
 * @param periodProgress The progress of the current period, represented as a decimal value between 0 and 1.
 * @param goal
 * @returns
 */
export function analyze(transactions: AbstractTransaction[]): TarnsactionsSummary {
  return transactions.reduce<TarnsactionsSummary>(
    (acc: TarnsactionsSummary, t: AbstractTransaction) => {
      if (t.recurrence === 'one-time') {
        if (t.amount >= 0) {
          acc.oneTimeIncome += t.amount
          acc.totalIncome += t.amount
        } else {
          acc.oneTimeExpenses += Math.abs(t.amount)
          acc.totalExpenses += Math.abs(t.amount)
        }

        if (t.forecast) acc.forecastable += t.amount
      } else {
        if (t.amount >= 0) {
          acc.fixedIncome += t.amount
          acc.totalIncome += t.amount
        } else {
          acc.fixedExpenses += Math.abs(t.amount)
          acc.totalExpenses += Math.abs(t.amount)
        }
      }
      return acc
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      oneTimeIncome: 0,
      oneTimeExpenses: 0,
      fixedIncome: 0,
      fixedExpenses: 0,
      forecastable: 0,
    },
  )
}

export function forecast(currentForecastable: number, periodProgress: number): number {
  if (periodProgress === 0) return 0

  return currentForecastable / periodProgress
}

export type DashboardData = {
  overall: TarnsactionsSummary
  categories: Record<string, TarnsactionsSummary>
}

/**
 * Process all data for the dashboard
 */
export function processDashboardData(transactions: AbstractTransaction[]): DashboardData {
  const overallSummary = analyze(transactions)

  const transactionsByCategory = Object.groupBy(transactions, (t) => t.category_id)
  const categoriesSummary = Object.entries(transactionsByCategory).map(([catId, catTxs]) => {
    if (!catTxs) throw new Error(`No transactions found for category ID ${catId}`)

    const summary = analyze(catTxs)
    return [catId, summary]
  })

  return {
    overall: overallSummary,
    categories: Object.fromEntries(categoriesSummary),
  }
}
