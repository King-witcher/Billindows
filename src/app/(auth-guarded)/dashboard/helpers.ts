import type { Category } from '@prisma/client'
import type { Transaction } from '@/database/repositories/transactions'
import type { ChartData } from './components/types'

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
export function analyze(transactions: Transaction[]): TarnsactionsSummary {
  return transactions.reduce<TarnsactionsSummary>(
    (acc: TarnsactionsSummary, tx: Transaction) => {
      if (tx.type === 'one-time') {
        if (tx.value >= 0) {
          acc.oneTimeIncome += tx.value
          acc.totalIncome += tx.value
        } else {
          acc.oneTimeExpenses += Math.abs(tx.value)
          acc.totalExpenses += Math.abs(tx.value)
        }

        if (tx.forecast) acc.forecastable += tx.value
      } else {
        if (tx.value >= 0) {
          acc.fixedIncome += tx.value
          acc.totalIncome += tx.value
        } else {
          acc.fixedExpenses += Math.abs(tx.value)
          acc.totalExpenses += Math.abs(tx.value)
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

/**
 * Analyzes transactions grouped by category
 * @param transactions All transactions for the period
 * @param categories All categories
 * @param periodProgress The progress of the current period (0-1)
 * @returns Analysis for each category
 */
// export function analyzeByCategory(
//   transactions: Transaction[],
//   categories: Category[],
// ): CategoryAnalysis[] {
//   // TODO: Improve with hash map for categories
//   return categories.map((category) => {
//     const categoryTxs = transactions.filter((tx) => tx.category_id === category.id)
//     const analysis = analyze(categoryTxs)

//     return {
//       category,
//       ...analysis,
//     }
//   })
// }

export type DashboardData = {
  overall: TarnsactionsSummary
  categories: Record<string, TarnsactionsSummary>
}

/**
 * Process all data for the dashboard
 */
export function processDashboardData(fixed: Transaction[], oneTime: Transaction[]): DashboardData {
  const allTransactions = [...fixed, ...oneTime]
  const overallSummary = analyze(allTransactions)

  const transactionsByCategory = Object.groupBy(allTransactions, (tx) => tx.category_id)
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

// export type TransactionType = 'expenses' | 'income'
// export type BalanceType = 'actual' | 'forecast'

// /** Filter and prepare chart data based on transaction and balance types */
// export function prepareChartData(
//   categories: CategoryAnalysis[],
//   transactionType: TransactionType,
//   balanceType: BalanceType,
// ): ChartData[] {
//   const filtered = categories.filter((cat) => {
//     const value = balanceType === 'actual' ? cat.actualBalance : cat.forecastBalance
//     if (transactionType === 'income') return value > 0
//     return value < 0
//   })

//   return filtered
//     .map((cat) => {
//       const value = balanceType === 'actual' ? cat.actualBalance : cat.forecastBalance
//       return {
//         name: cat.category.name,
//         value: Math.abs(value) / 100,
//         fill: cat.category.color,
//       }
//     })
//     .sort((a, b) => b.value - a.value)
// }
