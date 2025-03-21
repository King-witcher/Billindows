import { Prisma, PrismaClient } from '@prisma/client'
import { range } from 'lodash'
import { faker } from '@faker-js/faker'
import { hashSync } from 'bcrypt'

const prisma = new PrismaClient()

async function createTransactions(categoryId: number, count: number) {
  const transactionsData: Prisma.OneOffTransactionCreateWithoutCategoryInput[] =
    range(count).map(() => ({
      date: faker.date.recent({
        days: 60,
      }),
      name: faker.commerce.product(),
      value: faker.number.int({
        min: -1000,
        max: 1000,
      }),
    }))

  await prisma.category.update({
    where: { id: categoryId },
    data: { oneOffTransactions: { create: transactionsData } },
  })
}

async function createCategories(
  userId: number,
  count: number,
  transactions = true
): Promise<void> {
  const TRANSACTION_COUNT = 400
  const categoriesData: Prisma.CategoryCreateManyInput[] = range(count).map(
    () => ({
      userId,
      name: faker.finance.transactionType(),
      color: faker.color.rgb(),
      goal: faker.number.int({ min: 4, max: 30 }) * 10_000,
    })
  )

  const categories = await prisma.category.createManyAndReturn({
    data: categoriesData,
  })

  if (transactions) {
    await Promise.all(
      categories.map((category) =>
        createTransactions(category.id, TRANSACTION_COUNT)
      )
    )
  }
}

async function createUsers(
  count: number,
  categories = true,
  transactions = true
) {
  const CATEGORY_COUNT = 10
  const usersData: Prisma.UserCreateInput[] = range(count).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordDigest: '',
  }))

  const users = await prisma.user.createManyAndReturn({
    data: usersData,
  })

  if (categories) {
    await Promise.all(
      users.map((user) =>
        createCategories(user.id, CATEGORY_COUNT, transactions)
      )
    )
  }
}

async function main() {
  console.log('Seeding users...')
  await createUsers(50, true, true)

  console.log('Creating test user...')
  await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test Account',
      passwordDigest: await hashSync('1234', 10),
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
