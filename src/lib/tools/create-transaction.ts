import { TransactionsRepository } from '@/database/repositories/transactions'
import { Tool } from '../agent'
import * as zod from 'zod'
import { CategoriesRepository } from '@/database/repositories/categories'

const paramsSchema = zod.object({
  userId: zod.number().describe('The ID of the user creating the transaction.'),
  name: zod
    .string()
    .describe('A name describing what the transaction is about.'),
  value: zod.number().describe('The monetary value of the transaction.'),
  year: zod
    .number()
    .describe(
      'The year when the transaction occurs. If the user does not provide it, assume the current year.'
    ),
  month: zod
    .number()
    .describe(
      'The month when the transaction occurs (0-11). If the user does not provide it, assume the current month.'
    ),
  day: zod
    .number()
    .describe(
      'The day of the month when the transaction occurs (1-31). If the user does not provide it, assume the current day.'
    ),
  type: zod
    .enum(['fixed', 'one-time'])
    .describe(
      'The type of transaction, either fixed or one-time. Fixed transactions recur monthly, while one-time transactions occur only once.'
    ),
  forecast: zod
    .boolean()
    .describe(
      'If this value is true, the dashboard will consider this transaction for the income/expense rate and monthly forecast. By default, this value is true unless specified by the user.'
    )
    .default(true),
  sign: zod
    .enum(['income', 'expense'])
    .describe('Whether the transaction is an income or an expense.'),
  category: zod
    .string()
    .describe(
      'The category name of the transaction. Eg.: Food, Rent, Salary, etc.'
    ),
})

export const createTransactionTool: Tool<typeof paramsSchema> = {
  name: 'create_transaction',
  description:
    'Saves a new user transaction, such as an expense or income, in the database.',
  schema: paramsSchema,
  execute: async (args) => {
    try {
      const txRepo = new TransactionsRepository()
      const catRepo = new CategoriesRepository(args.userId)

      const categories = await catRepo.listCategories()

      await txRepo.createTransaction({
        name: args.name,
        value: (args.sign === 'income' ? 1 : -1) * args.value * 100,
        year: args.year,
        month: args.month,
        day: args.day,
        type: args.type,
        forecast: args.forecast,
        category_id: categories[0].id,
      })

      return 'Transaction created successfully!'
    } catch (error) {
      return `Failed to create transaction: ${error}`
    }
  },
}
