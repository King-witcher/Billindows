import { Prisma } from '@prisma/client'
import { range } from 'lodash'
import { faker } from '@faker-js/faker'
import { hashSync } from 'bcrypt'
import { prisma } from './helpers/prisma'
import { addFixedTxs, addOneTimeTxs } from './helpers/transactions'

async function createCategories(
  userId: number,
  count: number,
  transactions = true
): Promise<void> {
  const TX_COUNT = 50
  const FIXED_TX_COUNT = 2
  const categoriesData: Prisma.CategoryCreateManyInput[] = range(count).map(
    () => ({
      user_id: userId,
      name: faker.finance.transactionType(),
      color: faker.color.rgb(),
      goal: faker.number.int({ min: 4, max: 30 }) * 10_000,
    })
  )

  const categories = await prisma.category.createManyAndReturn({
    data: categoriesData,
  })

  if (transactions) {
    await Promise.all([
      ...categories.map(({ id }) => addOneTimeTxs(id, TX_COUNT)),
      ...categories.map(({ id }) => addFixedTxs(id, FIXED_TX_COUNT)),
    ])
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
    password_digest: '',
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
  const testUser = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test Account',
      password_digest: await hashSync('1234', 10),
    },
  })

  await createCategories(testUser.id, 4, true)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
