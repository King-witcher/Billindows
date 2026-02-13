import { uuidv7 } from 'uuidv7'
import type { DependencyContainer } from '@/lib/injector/dependencies'
import type { UserRow } from '../types'

export class UsersRepository {
  constructor(private readonly ctx: DependencyContainer) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const [user] = await this.ctx.db.sql<UserRow | null>`
      SELECT *
      FROM "user"
      WHERE "email" = ${email}
      LIMIT 1
    `
    return user ?? null
  }

  async create(data: Omit<UserRow, 'id'>): Promise<UserRow> {
    const id = uuidv7()
    const [user] = await this.ctx.db.sql<UserRow>`
      INSERT INTO "user" ("id", "name", "email", "password_digest")
      VALUES (${id}, ${data.name}, ${data.email}, ${data.password_digest})
      RETURNING *
    `
    return user
  }
}
