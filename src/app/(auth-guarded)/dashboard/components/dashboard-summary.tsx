import { Calendar, Repeat, Target, TrendingUp, Wallet } from 'lucide-react'
import { forecast, type TarnsactionsSummary } from '../helpers'
import { SummaryCard } from './balance-card'

type Props = {
  summary: TarnsactionsSummary
  monthProgress: number
}

export function DashboardSummary({ summary, monthProgress }: Props) {
  const balance = summary.totalIncome - summary.totalExpenses
  const unforecastable = balance - summary.forecastable
  const balanceForecast = unforecastable + forecast(summary.forecastable, monthProgress)
  const fixedBalance = summary.fixedIncome - summary.fixedExpenses
  const oneTimeBalance = summary.oneTimeIncome - summary.oneTimeExpenses

  const usePercentage = summary.totalIncome === 0 ? 0 : 1 - Math.abs(balance) / summary.totalIncome
  const forecastPercentage =
    summary.totalIncome === 0 ? 0 : 1 - Math.abs(balanceForecast) / summary.totalIncome

  const fixedPercentage =
    summary.totalIncome === 0 ? 0 : Math.abs(fixedBalance) / summary.totalIncome

  const oneTimeProgress = fixedBalance === 0 ? 0 : Math.abs(oneTimeBalance) / fixedBalance

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard
        title="Current Balance"
        value={balance}
        subtitle="Month total so far"
        icon={<Wallet className="h-4 w-4" />}
        showProgress
        progressValue={usePercentage * 100}
        progressLabel="of your income is already gone"
      />
      <SummaryCard
        title="Forecast"
        value={balanceForecast}
        subtitle="If the pace continues"
        icon={<TrendingUp className="h-4 w-4" />}
        showProgress
        progressValue={forecastPercentage * 100}
        progressLabel="of your income will be spent"
      />
      <SummaryCard
        title="Fixed Balance"
        value={fixedBalance}
        subtitle="Recurring transactions"
        icon={<Repeat className="h-4 w-4" />}
        showProgress
        progressValue={fixedPercentage * 100}
        progressLabel="of your income remains after fixed expenses"
      />
      <SummaryCard
        title="One-time Balance"
        value={oneTimeBalance}
        subtitle="One-time transactions"
        icon={<Calendar className="h-4 w-4" />}
        showProgress
        progressValue={oneTimeProgress * 100}
        progressLabel="of your remaining balance was spent"
      />
    </div>
  )
}
