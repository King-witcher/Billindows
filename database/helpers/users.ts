import { faker } from '@faker-js/faker'
import type { Prisma } from '@prisma/client'
import { range } from 'lodash'
import { createCategories } from './categories'
import { prisma } from './prisma'

export async function createUsers(count: number, categories = true, transactions = true) {
  const CATEGORY_COUNT = 10
  const usersData: Prisma.UserCreateInput[] = range(count).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password_digest: '',
  }))

  const users = await prisma.user.createManyAndReturn({
    data: usersData,
  })

  if (categories) {
    await Promise.all(users.map((user) => createCategories(user.id, CATEGORY_COUNT, transactions)))
  }
}
