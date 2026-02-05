import type { WithId } from '@/types/with-id'
import { DBTime } from '@/utils/time'
import { prisma } from '../prisma'

export type Transaction = {
  name: string
  value: number
  year: number
  month: number
  day: number
  type: 'fixed' | 'one-time'
  forecast: boolean
  category_id: number
}

export class TransactionsRepository {
  async createTransaction(tx: Transaction) {
    const month = DBTime.fromYMToDB(tx.year, tx.month)

    if (tx.type === 'one-time') {
      await prisma.oneTimeTx.create({
        data: {
          month,
          day: tx.day,
          name: tx.name,
          value: tx.value,
          forecast: tx.forecast,
          category_id: tx.category_id,
        },
      })
    } else if (tx.type === 'fixed') {
      await prisma.fixedTx.create({
        data: {
          start_month: month,
          end_month: null,
          day: tx.day,
          name: tx.name,
          value: tx.value,
          category_id: tx.category_id,
        },
      })
    }
  }

  async updateTransaction(id: number, tx: Transaction) {
    const month = DBTime.fromYMToDB(tx.year, tx.month)

    if (tx.type === 'one-time') {
      await prisma.oneTimeTx.update({
        where: { id },
        data: {
          month,
          day: tx.day,
          name: tx.name,
          value: tx.value,
          forecast: tx.forecast,
          category_id: tx.category_id,
        },
      })
    } else if (tx.type === 'fixed') {
      await prisma.fixedTx.update({
        where: { id },
        data: {
          start_month: month,
          end_month: null,
          day: tx.day,
          name: tx.name,
          value: tx.value,
          category_id: tx.category_id,
        },
      })
    }
  }

  async deleteTransaction(id: number, type: 'fixed' | 'one-time') {
    if (type === 'fixed') {
      await prisma.fixedTx.delete({
        where: {
          id,
        },
      })
    } else if (type === 'one-time') {
      await prisma.oneTimeTx.delete({
        where: {
          id,
        },
      })
    }
  }

  async getFixedTxs(userId: number, year: number, month: number): Promise<WithId<Transaction>[]> {
    const dbMonthNow = DBTime.fromYMToDB(year, month)

    const now = Date.now()
    const queryResults: {
      id: number
      name: string
      value: number
      start_month: number
      day: number
      category_id: number
      category_color: string
      category_name: string
    }[] = await prisma.$queryRaw`
      WITH c AS (
        SELECT id, color, name
        FROM categories
        WHERE user_id = ${userId}
      )

      SELECT
        t.id,
        t.name,
        t.value,
        t.start_month,
        t.day,
        t.category_id
      FROM c INNER JOIN fixed_txs t
          ON c.id = t.category_id
      WHERE
        t.start_month <= ${dbMonthNow}
        AND (
          t.end_month IS NULL
          OR t.end_month > ${dbMonthNow}
        )
    `
    console.log(`Got ${queryResults.length} fixed transactions in ${Date.now() - now}ms.`)

    return queryResults.map((result): WithId<Transaction> => {
      const [year, month] = DBTime.fromDBToYM(result.start_month)
      return {
        category_id: result.category_id,
        year,
        month,
        day: result.day,
        type: 'fixed',
        forecast: false,
        id: result.id,
        name: result.name,
        value: result.value,
      }
    })
  }
}
