import type { DependencyContainer } from '@/lib/injector/dependencies'
import type { CategoryRow } from '../types'
import type { UUID, UUID_v7 } from '../types/postgres'

export class CategoriesRepository {
  constructor(private readonly ctx: DependencyContainer) {}

  async create(data: Omit<CategoryRow, 'id'>): Promise<CategoryRow> {
    const [category] = await this.ctx.db.sql<CategoryRow>`
      INSERT INTO category ("user_id", "name", "color", "goal")
      VALUES (${data.user_id}, ${data.name}, ${data.color}, ${data.goal})
      RETURNING *
    `

    return category
  }

  async get(id: UUID): Promise<CategoryRow | null> {
    const [category] = await this.ctx.db.sql<CategoryRow | null>`
      SELECT *
      FROM category
      WHERE id = ${id}
    `
    return category ?? null
  }

  async list(userId: UUID_v7): Promise<CategoryRow[]> {
    const now = Date.now()
    const categories = await this.ctx.db.sql<Omit<CategoryRow, 'user_id'>>`
      SELECT "id", "name", "color", "goal"
      FROM category
      WHERE "user_id" = ${userId}
      ORDER BY "name" ASC
    `
    console.debug(
      `Fetched ${categories.length} categories for user ${userId} in ${Date.now() - now}ms`,
    )

    return categories.map((c) => ({
      user_id: userId,
      ...c,
    }))
  }

  async update(
    id: UUID,
    userId: UUID_v7,
    category: Omit<CategoryRow, 'id' | 'user_id'>,
  ): Promise<UUID | null> {
    const rows = await this.ctx.db.sql<{ id: UUID }>`
      UPDATE category
      SET
        name = ${category.name},
        color = ${category.color},
        goal = ${category.goal}
      WHERE id = ${id}
      AND user_id = ${userId}
      RETURNING id
    `

    return rows.length > 0 ? rows[0].id : null
  }

  async delete(id: UUID, userId: UUID_v7): Promise<UUID | null> {
    const rows = await this.ctx.db.sql<{ id: UUID }>`
      DELETE FROM "category"
      WHERE "id" = ${id}
      AND "user_id" = ${userId}
      RETURNING "id"
    `
    return rows.length > 0 ? rows[0].id : null
  }
}
