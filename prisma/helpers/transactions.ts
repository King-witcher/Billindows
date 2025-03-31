import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'
import { range } from 'lodash'
import { prisma } from './prisma'
import { DBTime } from '@/utils/time'

export async function addFixedTxs(categoryId: number, count: number) {
  const txData = range(count).map(
    (): Prisma.FixedTxCreateWithoutCategoryInput => {
      const ENDED_ODDS = 1 / 5

      const start_date = faker.date.recent({
        days: 360,
      })

      const end_month = DBTime.getMonthByDate(
        faker.date.between({
          from: start_date,
          to: new Date(),
        })
      )

      const isEnded = Math.random() < ENDED_ODDS

      return {
        start_month: DBTime.getMonthByDate(start_date),
        end_month: isEnded ? end_month : null,
        day: start_date.getDate(),
        name: `FIXED ${faker.commerce.product()}`,
        value: faker.number.int({
          min: -10000,
          max: 10000,
        }),
      }
    }
  )

  await prisma.category.update({
    where: { id: categoryId },
    data: { fixedTxs: { create: txData } },
  })
}

export async function addOneTimeTxs(categoryId: number, count: number) {
  const txData = range(count).map(
    (): Prisma.OneTimeTxCreateWithoutCategoryInput => {
      const date = faker.date.recent({
        days: 60,
      })

      return {
        month: DBTime.getMonthByDate(date),
        day: date.getDate(),
        name: faker.commerce.product(),
        value: faker.number.int({
          min: -10000,
          max: 10000,
        }),
      }
    }
  )

  await prisma.category.update({
    where: { id: categoryId },
    data: { oneTimeTxs: { create: txData } },
  })
}
