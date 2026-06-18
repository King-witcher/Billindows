import type { BOOLEAN, DATE, INTEGER, TEXT, UUID } from './postgres'

export type OneTimeTransactionRow = {
  id: UUID
  user_id: UUID
  category_id: UUID
  name: TEXT
  amount: INTEGER
  forecast: BOOLEAN
  date: DATE
}
