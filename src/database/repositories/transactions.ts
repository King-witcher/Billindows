import type { FixedTx, OneTimeTx } from '@prisma/client'
import type { WithId } from '@/types/with-id'
import { DBTime } from '@/utils/time'
import { prisma } from '../prisma'

/** Abstracts both one-time-txs and fixed-txs tables as a single transaction object with type. */
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
  async create(tx: Transaction) {
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

  async update(id: number, tx: Transaction) {
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

  async delete(id: number, type: 'fixed' | 'one-time') {
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

  async listOneTimeTxs(
    userId: number,
    year: number,
    month: number,
  ): Promise<WithId<Transaction>[]> {
    const dbMonth = DBTime.fromYMToDB(year, month)

    const now = Date.now()
    const queryResults = await prisma.$queryRaw<OneTimeTx[]>`
      SELECT *
      FROM one_time_txs t
      WHERE t.month = ${dbMonth}
      AND EXISTS (
        SELECT 1
        FROM categories c
        WHERE c.id = t.category_id
        AND c.user_id = ${userId}
      )
    `
    console.debug(
      `Fetched ${queryResults.length} one-time transactions for user ${userId} in ${Date.now() - now}ms`,
    )

    return queryResults.map(
      ({ category_id, month: dbMonth, day, name, value, forecast, id }): WithId<Transaction> => {
        const [year, month] = DBTime.fromDBToYM(dbMonth)
        return {
          category_id,
          year,
          month,
          day,
          type: 'one-time',
          forecast,
          id,
          name,
          value,
        }
      },
    )
  }

  async listAllTxs(userId: number, year: number, month: number): Promise<WithId<Transaction>[]> {
    const dbMonthNow = DBTime.fromYMToDB(year, month)

    type QueryResult = {
      id: number
      type: 'fixed' | 'one-time'
      name: string
      value: number
      day: number
      forecast: boolean
      category_id: number
    }

    const now = Date.now()
    const results = await prisma.$queryRaw<QueryResult[]>`
      SELECT * FROM (
          SELECT
              t.id,
              'fixed' AS "type",
              t.name,
              t.value,
              t.day,
              TRUE AS "forecast",
              t.category_id
          FROM fixed_txs t
              JOIN categories c
                  ON c.id = t.category_id
                  AND c.user_id = ${userId}
          WHERE ${dbMonthNow} >= t.start_month
              AND (t.end_month IS NULL OR ${dbMonthNow} < t.end_month)

          UNION ALL

          SELECT
              t.id,
              'one-time' AS "type",
              t.name,
              t.value,
              t.day,
              t.forecast,
              t.category_id
          FROM one_time_txs t
              JOIN categories c
                  ON c.id = t.category_id
                  AND c.user_id = ${userId}
          WHERE t.month = ${dbMonthNow}
        ) q
    ORDER BY q.day DESC, q.type ASC, q.name ASC, q.id ASC`
    console.debug(
      `Fetched ${results.length} transactions for user ${userId} in ${Date.now() - now}ms`,
    )

    return results.map(({ id, type, name, value, day, forecast, category_id }) => {
      return {
        id,
        type,
        name,
        value,
        day,
        forecast,
        category_id,
        year,
        month,
      }
    })
  }

  async listFixedTxs(userId: number, year: number, month: number): Promise<WithId<Transaction>[]> {
    const dbMonthNow = DBTime.fromYMToDB(year, month)

    const now = Date.now()
    const queryResults = await prisma.$queryRaw<Omit<FixedTx, 'end_month'>[]>`
      SELECT "id", "category_id", "start_month", "day", "name", "value"
      FROM fixed_txs t
      WHERE t.start_month <= ${dbMonthNow}
      AND (
        t.end_month IS NULL OR t.end_month > ${dbMonthNow}
      )
      AND EXISTS (
        SELECT 1
        FROM categories c
        WHERE c.id = t.category_id
        AND c.user_id = ${userId}
      )
    `
    console.debug(
      `Fetched ${queryResults.length} fixed transactions for user ${userId} in ${Date.now() - now}ms`,
    )

    return queryResults.map(
      ({ id, category_id, start_month, day, name, value }): WithId<Transaction> => {
        const [year, month] = DBTime.fromDBToYM(start_month)
        return {
          category_id,
          year,
          month,
          day,
          type: 'fixed',
          forecast: false, // Fixed transactions
          id,
          name,
          value,
        }
      },
    )
  }
}
