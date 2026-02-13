import type { DependencyContainer } from '@/lib/injector/dependencies'
import { fail } from '@/lib/server-wrappers'
import { DBTime } from '@/utils/time'
import { prisma } from '../prisma'
import type { FixedTransactionRow, OneTimeTransactionRow } from '../types'
import type { GenericTransaction } from '../types/generic-transaction'

export type TransactionRecurrence = 'fixed' | 'one-time'

/** Abstracts both one-time-txs and fixed-txs tables as a single transaction object with type. */
export type Transaction = {
  id: number
  name: string
  amount: number
  year: number
  month: number
  day: number
  type: TransactionRecurrence
  forecast: boolean
  category_id: number
}

export class TransactionsRepository {
  constructor(private readonly ctx: DependencyContainer) {}

  /** Create a transaction regardless of the owner of it's transaction */
  async create(tx: Omit<GenericTransaction, 'id'>) {
    if (tx.type === 'fixed' && !tx.forecast) fail('FixedTransactionShouldForecast')

    const date = new Date(tx.date.year, tx.date.month - 1, tx.date.day)

    if (tx.type === 'one-time') {
      await this.createOneTimeTransaction({
        user_id: tx.user_id,
        amount: tx.amount,
        category_id: tx.category_id,
        name: tx.name,
        date,
        forecast: tx.forecast,
      })
    } else if (tx.type === 'fixed') {
      await this.createFixedTransaction({
        user_id: tx.user_id,
        amount: tx.amount,
        category_id: tx.category_id,
        name: tx.name,
        start_date: date,
        end_date: null,
      })
    }
  }

  async createOneTimeTransaction(t: Omit<OneTimeTransactionRow, 'id'>) {
    await this.ctx.db.sql`
      INSERT INTO
          one_time_transaction (
              "user_id",
              "category_id",
              "name",
              "amount",
              "forecast",
              "date"
          )
      VALUES(
          ${t.user_id},
          ${t.category_id},
          ${t.name},
          ${t.amount},
          ${t.forecast},
          ${t.date}
      )
    `
  }

  async createFixedTransaction(t: Omit<FixedTransactionRow, 'id' | 'fixed_transaction'>) {
    await this.ctx.db.sql`
      INSERT INTO
          fixed_transaction (
              "user_id",
              "category_id",
              "name",
              "amount",
              "start_date"
          )
      VALUES(
          ${t.user_id},
          ${t.category_id},
          ${t.name},
          ${t.amount},
          ${t.start_date}
      )
    `
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
            value: tx.amount,
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
            value: tx.amount,
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
  async delete(id: string, recurrence: TransactionRecurrence, userId: number) {
    const db = this.ctx.db

    switch (recurrence) {
      case 'one-time': {
        await db.sql`
          DELETE FROM one_time_txs
          WHERE id = ${id}
        `
        break
      }
      case 'fixed': {
        // await prisma.fixedTx.delete({
        //   where: {
        //     id,
        //   },
        // })
        break
      }
      default: {
        console.error(`Invalid transaction recurrence type: ${recurrence}`)
        throw new Error(`invalid-recurrence`)
      }
    }
  }

  /**
   * Lists all transactions for the current user in a given month and year
   *
   * @param userId - The ID of the user
   * @param year - The year of the transactions
   * @param month - The month from 1 to 12 of the transactions
   * @returns A promise that resolves to an array of transactions
   */
  async list(userId: number, year: number, month: number): Promise<Transaction[]> {
    const lastDayOfTheMonth = new Date(year, month, 0)
    const firstDayOfTheMonth = new Date(year, month - 1, 1)

    console.log(lastDayOfTheMonth, month)
    type QueryResult = {
      id: number
      type: 'fixed' | 'one-time'
      name: string
      amount: number
      day: number
      forecast: boolean
      category_id: number
    }

    const now = Date.now()
    const results = await this.ctx.db.sql<QueryResult>`
      SELECT *
      FROM (
          -- Fixed
          SELECT
              "id",
              'fixed' AS "type",
              "name",
              "amount",
              EXTRACT(DAY FROM "start_date") as "day",
              TRUE AS "forecast",
              "category_id"
          FROM
              fixed_transaction
          WHERE
              "user_id" = ${userId}
              AND "start_date" <= ${lastDayOfTheMonth}
              AND ("end_date" IS NULL OR "end_date" > ${lastDayOfTheMonth})

          UNION ALL

          -- One-time
          SELECT
              "id",
              'one-time' AS "type",
              "name",
              "amount",
              EXTRACT(DAY FROM "date") as "day",
              "forecast",
              "category_id"
          FROM
              one_time_transaction
          WHERE
              "user_id" = ${userId}
              AND "date" >= ${firstDayOfTheMonth}
              AND "date" <= ${lastDayOfTheMonth}
        ) q
      ORDER BY
        q.day DESC,
        q.name ASC,
        q.type ASC,
        q.id ASC`
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

  /** Gets the userId of a transaction */
  async getTxOwner(id: number, recurrence: TransactionRecurrence): Promise<number> {
    const [{ user_id }] =
      recurrence === 'fixed'
        ? await this.ctx.db.sql<{ user_id: number }>`
            SELECT c.user_id
            FROM categories c
            JOIN fixed_txs t
                ON c.id = t.category_id
            WHERE t.id = ${id}
        `
        : await this.ctx.db.sql<{ user_id: number }>`
            SELECT c.user_id
            FROM categories c
            JOIN one_time_txs t
                ON c.id = t.category_id
            WHERE t.id = ${id}
        `

    return user_id
  }
}
