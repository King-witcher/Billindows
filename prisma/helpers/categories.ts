import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'
import { range } from 'lodash'
import { addFixedTxs, addOneTimeTxs } from './transactions'
import { prisma } from './prisma'

export async function createCategories(
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
