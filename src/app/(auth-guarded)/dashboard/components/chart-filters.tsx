import { BanknoteArrowDown, BanknoteArrowUp, Calendar, TrendingUp } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { BalanceType, TransactionType } from '../helpers'

type Props = {
  transactionType: TransactionType
  balanceType: BalanceType
  onChangeTransactionType: (type: TransactionType) => void
  onChangeBalanceType: (type: BalanceType) => void
  className?: string
}

export function ChartFilters({
  transactionType,
  balanceType,
  onChangeTransactionType,
  onChangeBalanceType,
  className,
}: Props) {
  return (
    <div className={cn('flex flex-row gap-3', className)}>
      <Tabs
        value={transactionType}
        onValueChange={(v) => onChangeTransactionType(v as TransactionType)}
      >
        <TabsList>
          <TabsTrigger value="expenses">
            <BanknoteArrowDown className="text-red-600" />
            <span className="hidden sm:inline-block">Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="income">
            <BanknoteArrowUp className="text-green-600" />
            <span className="hidden sm:inline-block">Income</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs value={balanceType} onValueChange={(v) => onChangeBalanceType(v as BalanceType)}>
        <TabsList>
          <TabsTrigger value="actual">
            <Calendar />
            <span className="hidden sm:inline-block">Actual</span>
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp />
            <span className="hidden sm:inline-block">Forecast</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
