import type { DATE, INTEGER, TEXT, UUID } from './postgres'

export type FixedTransactionRow = {
  id: UUID
  user_id: UUID
  category_id: UUID
  name: TEXT
  amount: INTEGER
  start_date: DATE
  end_date: DATE | null
}
