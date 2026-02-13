import type { DependencyContainer } from '@/lib/injector/dependencies'
import { fail, fatal } from '@/lib/server-wrappers'
import type { FixedTransactionRow, OneTimeTransactionRow } from '../types'
import type { AbstractTransaction } from '../types/abstract-transaction'
import type { BOOLEAN, DATE, INTEGER, TEXT, UUID, UUID_v7 } from '../types/postgres'

export type TransactionRecurrence = 'fixed' | 'one-time'

export type UpdateTransactionInput = {
  name: string
  amount: number
  category_id: UUID
  date: {
    year: number
    month: number
    day: number
  }
  forecast: boolean
}

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
  async create(user_id: UUID_v7, tx: Omit<AbstractTransaction, 'id'>) {
    if (tx.recurrence === 'fixed' && !tx.forecast) fail('FixedTransactionShouldForecast')

    const date = new Date(tx.date.year, tx.date.month - 1, tx.date.day)

    if (tx.recurrence === 'one-time') {
      await this.createOneTimeTransaction({
        user_id,
        amount: tx.amount,
        category_id: tx.category_id,
        name: tx.name,
        date,
        forecast: tx.forecast,
      })
    } else if (tx.recurrence === 'fixed') {
      await this.createFixedTransaction({
        user_id,
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
  async update(id: UUID, recurrence: TransactionRecurrence, t: UpdateTransactionInput) {
    const db = this.ctx.db
    const date = new Date(t.date.year, t.date.month - 1, t.date.day)
    switch (recurrence) {
      case 'one-time': {
        db.sql`
          UPDATE one_time_transaction
          SET
              "name" = ${t.name},
              "amount" = ${t.amount},
              "category_id" = ${t.category_id},
              "date" = ${date},
              "forecast" = ${t.forecast}
          WHERE id = ${id}
        `
        break
      }
      case 'fixed': {
        if (!t.forecast) fail('FixedTransactionShouldForecast')
        db.sql`
          UPDATE fixed_transaction
          SET
              "name" = ${t.name},
              "amount" = ${t.amount},
              "category_id" = ${t.category_id},
              "start_date" = ${date}
          WHERE id = ${id}
        `
        break
      }
      default: {
        fatal(`Invalid transaction recurrence: ${recurrence}`)
      }
    }
  }

  /** Delete a transaction regardless of its owner. */
  async delete(id: UUID, userId: UUID_v7) {
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
  async list(userId: UUID, year: number, month: number): Promise<AbstractTransaction[]> {
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
        user_id: userId,
        category_id: result.category_id,
        recurrence: result.type,
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

  async find(id: UUID, recurrence: TransactionRecurrence): Promise<AbstractTransaction | null> {
    type QueryResult = {
      id: UUID
      user_id: UUID
      category_id: UUID
      name: TEXT
      amount: INTEGER
      date: DATE
      forecast: BOOLEAN
    }

    const [result] =
      recurrence === 'fixed'
        ? await this.ctx.db.sql<QueryResult>`
            SELECT
                "id",
                "user_id",
                "category_id",
                "name",
                "amount",
                "start_date",
                TRUE AS "forecast"
            FROM
                fixed_transaction
            WHERE
                "id" = ${id}
        `
        : await this.ctx.db.sql<QueryResult>`
            SELECT
                "id",
                "user_id",
                "category_id",
                "name",
                "amount",
                "date",
                "forecast"
            FROM
                one_time_transaction
            WHERE
                "id" = ${id}
        `

    if (!result) {
      return null
    }

    return {
      id: result.id,
      user_id: result.user_id,
      category_id: result.category_id,
      recurrence,
      name: result.name,
      forecast: result.forecast,
      amount: result.amount,
      date: {
        day: result.date.getDate(),
        month: result.date.getMonth() + 1,
        year: result.date.getFullYear(),
      },
    }
  }

  /**
   * Gets the userId of a transaction
   * @deprecated
   */
  async getTxOwner(id: UUID, recurrence: TransactionRecurrence): Promise<UUID_v7> {
    const [{ user_id }] =
      recurrence === 'fixed'
        ? await this.ctx.db.sql<{ user_id: UUID_v7 }>`
            SELECT c.user_id
            FROM category c
            JOIN fixed_transaction t
                ON c.id = t.category_id
            WHERE t.id = ${id}
        `
        : await this.ctx.db.sql<{ user_id: UUID_v7 }>`
            SELECT c.user_id
            FROM categories c
            JOIN one_time_transaction t
                ON c.id = t.category_id
            WHERE t.id = ${id}
        `

    return user_id
  }
}
