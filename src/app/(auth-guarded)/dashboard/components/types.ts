import type { TxDto } from '@/utils/queries/get-one-time-txs'

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
