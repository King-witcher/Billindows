import { prisma } from '@/services/prisma'
import { Category } from '@prisma/client'

export class CategoriesRepository {
  constructor(private userId: number) {}

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
