import type { Category } from '@prisma/client'
import type { ZodObject } from 'zod'
import * as zod from 'zod'
import { TransactionsRepository } from '@/database/repositories/transactions'
import { slugify } from '@/utils/utils'
import type { Tool, ToolExecuteArgs } from './tool'

type CreateTransactionToolParams = {
  categories: Category[]
}

export class CreateTransactionTool implements Tool {
  private categoryMap: Map<string, Category>

  readonly schema: ZodObject
  readonly name = 'create_transaction'
  readonly description =
    'Creates a new user transaction, such as an expense or income, in the database.'

  constructor({ categories }: CreateTransactionToolParams) {
    this.categoryMap = new Map(categories.map((cat) => [slugify(cat.name), cat]))

    this.schema = zod.object({
      name: zod.string().describe('A name describing what the transaction is about.'),
      value: zod.number().describe('The monetary value of the transaction.'),
      year: zod
        .number()
        .describe(
          'The year when the transaction occurs. If the user does not provide it, assume the current year.',
        ),
      month: zod
        .number()
        .describe(
          'The month when the transaction occurs (0-11). If the user does not provide it, assume the current month.',
        ),
      day: zod
        .number()
        .describe(
          'The day of the month when the transaction occurs (1-31). If the user does not provide it, assume the current day.',
        ),
      type: zod
        .enum(['fixed', 'one-time'])
        .describe(
          'The type of transaction, either fixed or one-time. Fixed transactions recur monthly, while one-time transactions occur only once.',
        ),
      forecast: zod
        .boolean()
        .describe(
          "If this value is true, the dashboard will consider this transaction for the income/expense rate and monthly forecast. This is typically false for transactions that are unexpected or won't happen again in the month.",
        )
        .default(true),
      sign: zod
        .enum(['income', 'expense'])
        .describe('Whether the transaction is an income or an expense.'),
      category: zod
        .enum(Array.from(this.categoryMap.keys()))
        .describe('The category name of the transaction.'),
    })
  }

  async execute(args: ToolExecuteArgs): Promise<string> {
    try {
      const txRepo = new TransactionsRepository()
      this.schema.parse(args)

      await txRepo.create({
        name: args.name,
        value: (args.sign === 'income' ? 1 : -1) * args.value * 100,
        year: args.year,
        month: args.month,
        day: args.day,
        type: args.type,
        forecast: args.forecast,
        category_id: this.categoryMap.get(args.category)!.id,
      })

      return 'Transaction created successfully!'
    } catch (error) {
      if (error instanceof zod.ZodError) {
        return `Invalid arguments: ${error.message}`
      }
      return `Failed to create transaction: ${error}. Do not expose this message to the user.`
    }
  }
}
