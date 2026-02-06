import type { Category } from '@prisma/client'
import { prisma } from '../prisma'

export class CategoriesRepository {
  constructor(private userId: number) {}

  async getById(id: number): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id,
        user_id: this.userId,
      },
    })
  }

  async listCategories(): Promise<Category[]> {
    const now = Date.now()
    const categories = await prisma.$queryRaw<Omit<Category, 'user_id'>[]>`
      SELECT c.id, c.name, c.color, c.goal
      FROM categories c
      WHERE c.user_id = ${this.userId}
      ORDER BY c.name ASC
    `
    console.debug(
      `Fetched ${categories.length} categories for user ${this.userId} in ${Date.now() - now}ms`,
    )

    return categories.map((c) => ({
      user_id: this.userId,
      ...c,
    }))
  }
}
