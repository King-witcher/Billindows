import type { FixedTx, OneTimeTx } from '@prisma/client'
import type { WithId } from '@/types/with-id'
import { DBTime } from '@/utils/time'
import { prisma } from '../prisma'

export type TransactionRecurrence = 'fixed' | 'one-time'

/** Abstracts both one-time-txs and fixed-txs tables as a single transaction object with type. */
export type Transaction = {
  id: number
  name: string
  value: number
  year: number
  month: number
  day: number
  type: TransactionRecurrence
  forecast: boolean
  category_id: number
}

export class TransactionsRepository {
  /** Create a transaction regardless of the owner of it's transaction */
  async create(tx: Omit<Transaction, 'id'>) {
    const month = DBTime.fromYMToDB(tx.year, tx.month)
    if (tx.type === 'fixed' && !tx.forecast) {
      throw new Error('fixed-transaction-should-forecast')
    }

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

  /**
   * Update a transaction regardless of its owner.
   *
   * Transaction recurrence cannot be changed after creation.
   */
  async update(
    id: number,
    recurrence: TransactionRecurrence,
    tx: Omit<Transaction, 'id' | 'type'>,
  ) {
    const month = DBTime.fromYMToDB(tx.year, tx.month)
    if (recurrence === 'fixed' && !tx.forecast) {
      throw new Error('fixed-transaction-should-forecast')
    }

    switch (recurrence) {
      case 'one-time': {
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
        break
      }
      case 'fixed': {
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
        break
      }
      default: {
        console.error(`Invalid transaction recurrence type: ${recurrence}`)
        throw new Error(`invalid-recurrence`)
      }
    }
  }

  /** Delete a transaction regardless of its owner. */
  async delete(id: number, recurrence: TransactionRecurrence) {
    switch (recurrence) {
      case 'one-time': {
        await prisma.oneTimeTx.delete({
          where: {
            id,
          },
        })
        break
      }
      case 'fixed': {
        await prisma.fixedTx.delete({
          where: {
            id,
          },
        })
        break
      }
      default: {
        console.error(`Invalid transaction recurrence type: ${recurrence}`)
        throw new Error(`invalid-recurrence`)
      }
    }
  }

  /** Lists all one time transactions for the current user in a given month and year */
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

  /** Lists all transactions for the current user in a given month and year */
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

  /** Lists all fixed transactions for the current user in a given month and year */
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

  /** Gets the transaction, it's category and user in a single query */
  async getFullTxData(id: number, recurrence: TransactionRecurrence): Promise<void> {}

  /** Gets the userId of a transaction */
  async getTxOwner(id: number, recurrence: TransactionRecurrence): Promise<number> {
    const [{ user_id }]: [{ user_id: number }] =
      recurrence === 'fixed'
        ? await prisma.$queryRaw`
            SELECT c.user_id
            FROM categories c
            JOIN fixed_txs t
                ON c.id = t.category_id
            WHERE t.id = ${id}
        `
        : await prisma.$queryRaw`
            SELECT c.user_id
            FROM categories c
            JOIN one_time_txs t
                ON c.id = t.category_id
            WHERE t.id = ${id}
        `

    return user_id
  }
}
