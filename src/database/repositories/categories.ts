import type { Category } from '@prisma/client'
import { prisma } from '@/services/prisma'

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
    return prisma.category.findMany({
      where: {
        user_id: this.userId,
      },
      orderBy: {
        name: 'asc',
      },
    })
  }
}
