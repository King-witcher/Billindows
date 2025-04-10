import { TxDto } from '@/utils/queries/get-one-time-txs'

type GroupAnalysis = {
  /** Total balance of transactions. */
  balance: number

  /** Balance of fixed transactions. */
  fixed: number

  /** Balance of one-time transactions. */
  oneTime: number

  /** Forecasted balance of transactions. */
  forecast: number

  /** Progress towards the goal. */
  progress: number | null
}

/**
 * Analyzes the transactions to calculate the fixed, one-time, and forecasted balances.
 * @param transactions
 * @param priodProgress The progress of the current period, represented as a decimal value between 0 and 1.
 * @param goal
 * @returns
 */
export function analyze(
  transactions: TxDto[],
  priodProgress: number,
  goal: number | null
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

  const rate = forecastable / priodProgress
  const forecast = fixed + oneTime + rate * (1 - priodProgress)

  return {
    balance: fixed + oneTime,
    fixed,
    oneTime,
    forecast,
    progress: goal ? (fixed + oneTime) / goal : null,
  }
}
