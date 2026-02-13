import type { TransactionRecurrence } from '../repositories'
import type { BOOLEAN, INTEGER, TEXT, UUID } from './postgres'

export type AbstractTransactionType = 'fixed' | 'one-time'

export type AbstractTransactionDate = {
  year: number
  month: number
  day: number
}

export type AbstractTransaction = {
  id: UUID
  user_id: UUID
  category_id: UUID
  recurrence: TransactionRecurrence
  name: TEXT
  amount: INTEGER
  forecast: BOOLEAN
  date: AbstractTransactionDate
  // end_date: GenericTransactionDate | null // Hidden since ended transactions are not queried.
}
