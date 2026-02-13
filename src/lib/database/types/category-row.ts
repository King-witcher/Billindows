import type { INTEGER, TEXT, UUID } from './postgres'

export type CategoryRow = {
  id: UUID
  user_id: UUID
  name: TEXT
  color: TEXT
  goal: INTEGER | null
}
