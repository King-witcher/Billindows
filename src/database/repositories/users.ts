import type { User } from '@prisma/client'
import { prisma } from '../prisma'

export class UsersRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email,
      },
    })
  }

  async create(data: Omit<User, 'id' | 'create_date'>): Promise<User> {
    return prisma.user.create({
      data,
    })
  }
}
