import type { Category } from '@prisma/client'
import { prisma } from '../prisma'

export class CategoriesRepository {
  async create(data: Omit<Category, 'id'>): Promise<Category> {
    return prisma.category.create({
      data,
    })
  }

  async find(userId: number, id: number): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id,
        user_id: userId,
      },
    })
  }

  async list(userId: number): Promise<Category[]> {
    const now = Date.now()
    const categories = await prisma.$queryRaw<Omit<Category, 'user_id'>[]>`
      SELECT c.id, c.name, c.color, c.goal
      FROM categories c
      WHERE c.user_id = ${userId}
      ORDER BY c.name ASC
    `
    console.debug(
      `Fetched ${categories.length} categories for user ${userId} in ${Date.now() - now}ms`,
    )

    return categories.map((c) => ({
      user_id: userId,
      ...c,
    }))
  }

  async updateForUser(
    userId: number,
    id: number,
    category: Omit<Category, 'id' | 'user_id'>,
  ): Promise<number> {
    return await prisma.$executeRaw`
      UPDATE categories
      SET
        name = ${category.name},
        color = ${category.color},
        goal = ${category.goal}
      WHERE id = ${id}
      AND user_id = ${userId}
    `
  }

  async deleteForUser(userId: number, id: number): Promise<number> {
    const rows = await prisma.$executeRaw<number[]>`
      DELETE FROM categories
      WHERE id = ${id} AND user_id = ${userId}
    `
    return rows
  }
}
