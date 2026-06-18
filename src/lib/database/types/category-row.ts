import type { INTEGER, TEXT, UUID, UUID_v7 } from './postgres'

export type CategoryRow = {
  id: UUID
  user_id: UUID_v7
  name: TEXT
  color: TEXT
  goal: INTEGER | null
}
