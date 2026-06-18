import type { TEXT, UUID_v7, VARCHAR_60 } from './postgres'

export type UserRow = {
  id: UUID_v7
  name: TEXT
  email: TEXT
  password_digest: VARCHAR_60
}
