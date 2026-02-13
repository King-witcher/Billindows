import type { DependencyContainer } from '@/lib/injector/dependencies'
import { fail } from '@/lib/server-wrappers'
import { DBTime } from '@/utils/time'
import { prisma } from '../prisma'
import type { FixedTransactionRow, OneTimeTransactionRow } from '../types'
import type { AbstractTransaction } from '../types/generic-transaction'
import type { BOOLEAN, INTEGER, TEXT, UUID } from '../types/postgres'

export type TransactionRecurrence = 'fixed' | 'one-time'

/**
 * Abstracts both one-time-txs and fixed-txs tables as a single transaction object with type.
 * @deprecated
 */
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

/** Represents a unified repository that abstracts the separation between one-time and fixed transactions. */
export class TransactionsRepository {
  constructor(private readonly ctx: DependencyContainer) {}

  /** Create a transaction regardless of the owner of it's transaction */
  async create(tx: Omit<AbstractTransaction, 'id'>) {
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

  private async createOneTimeTransaction(t: Omit<OneTimeTransactionRow, 'id'>) {
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

  private async createFixedTransaction(t: Omit<FixedTransactionRow, 'id' | 'fixed_transaction'>) {
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
    fail('NotImplemented')
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
  async delete(id: UUID, userId: UUID) {
    const db = this.ctx.db

    const [row] = await db.sql<{ id: UUID }>`
      WITH deleted_one_time AS (
          DELETE FROM
              one_time_transaction
          WHERE
              id = ${id}
              AND user_id = ${userId}
          RETURNING id
      ),
      deleted_fixed AS (
          DELETE FROM
              fixed_transaction
          WHERE
              id = ${id}
              AND user_id = ${userId}
              AND NOT EXISTS (SELECT 1 FROM deleted_one_time)
          RETURNING id
      )
      SELECT id FROM deleted_one_time
      UNION ALL
      SELECT id FROM deleted_fixed;
    `

    if (!row) {
      fail('TransactionNotFound')
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
  async list(userId: number, year: number, month: number): Promise<AbstractTransaction[]> {
    const lastDayOfTheMonth = new Date(year, month, 0)
    const firstDayOfTheMonth = new Date(year, month - 1, 1)

    type QueryResult = {
      id: UUID
      category_id: UUID
      type: TransactionRecurrence
      name: TEXT
      amount: INTEGER
      day: INTEGER
      forecast: BOOLEAN
    }

    const now = Date.now()
    const results = await this.ctx.db.sql<QueryResult>`
      SELECT *
      FROM (
          -- Fixed
          SELECT
              "id",
              "category_id",
              'fixed' AS "type",
              "name",
              "amount",
              EXTRACT(DAY FROM "start_date") as "day",
              TRUE AS "forecast"
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
              "category_id",
              'one-time' AS "type",
              "name",
              "amount",
              EXTRACT(DAY FROM "date") as "day",
              "forecast"
          FROM
              one_time_transaction
          WHERE
              "user_id" = ${userId}
              AND "date" >= ${firstDayOfTheMonth}
              AND "date" <= ${lastDayOfTheMonth}
        )
      ORDER BY
        "day" DESC,
        "name" ASC,
        "type" ASC,
        "id" ASC`
    console.debug(
      `Fetched ${results.length} transactions for user ${userId} in ${Date.now() - now}ms`,
    )

    return results.map((result): AbstractTransaction => {
      return {
        id: result.id,
        category_id: result.category_id,
        type: result.type,
        name: result.name,
        amount: result.amount,
        date: {
          day: result.day,
          month,
          year,
        },
        forecast: result.forecast,
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
