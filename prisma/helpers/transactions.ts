import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'
import { range } from 'lodash'
import { prisma } from './prisma'

export async function addFixedTransactions(categoryId: number, count: number) {
  const transactionData: Prisma.FixedTransactionCreateWithoutCategoryInput[] =
    range(count).map(() => {
      const start_date = faker.date.recent({
        days: 360,
      })

      return {
        start_date,
        end_date: null,
        name: `FIXED ${faker.commerce.product()}`,
        value: faker.number.int({
          min: -10000,
          max: 10000,
        }),
      }
    })

  await prisma.category.update({
    where: { id: categoryId },
    data: { fixedTransactions: { create: transactionData } },
  })
}

export async function addOneOffTransactions(categoryId: number, count: number) {
  const transactionsData: Prisma.OneOffTransactionCreateWithoutCategoryInput[] =
    range(count).map(() => ({
      date: faker.date.recent({
        days: 60,
      }),
      name: faker.commerce.product(),
      value: faker.number.int({
        min: -10000,
        max: 10000,
      }),
    }))

  await prisma.category.update({
    where: { id: categoryId },
    data: { oneOffTransactions: { create: transactionsData } },
  })
}
