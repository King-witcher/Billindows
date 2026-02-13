import type { INTEGER, TEXT, UUID, UUID_v7 } from './postgres'

export type OneTimeTransactionRow = {
  id: UUID
  category_id: UUID
  user_id: UUID
  name: TEXT
  value: INTEGER
  yearn: INTEGER
  month: INTEGER
  day: INTEGER
}
