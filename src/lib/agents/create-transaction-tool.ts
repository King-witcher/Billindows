import * as zod from 'zod'
import { slugify } from '@/utils/utils'
import type { Tool } from '../agent/tool'

type ToolArgs = {
  name: string
  value: number
  year: number
  month: number
  day: number
  type: 'fixed' | 'one-time'
  forecast: boolean
  sign: 'income' | 'expense'
  category: string
}

export const createTransactionTool: Tool = {
  name: 'create_transaction',
  description: 'Creates a new user transaction, such as an expense or income, in the database.',
  schema: async (ctx) => {
    const jwt = await ctx.requireAuth()
    const categories = await ctx.repositories.categories.list(jwt.id)

    return zod.object({
      name: zod.string().describe('A name describing what the transaction is about.'),
      value: zod.number().describe('The monetary value of the transaction.'),
      year: zod
        .int()
        .describe(
          'The year when the transaction occurs. If the user does not provide it, assume the current year.',
        ),
      month: zod
        .int()
        .min(1)
        .max(12)
        .describe(
          'The month when the transaction occurs (1-12). If the user does not provide it, assume the current month.',
        ),
      day: zod
        .int()
        .min(1)
        .max(31)
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
        .enum(categories.map((cat) => slugify(cat.name)))
        .describe('The category name of the transaction.'),
    })
  },

  async execute(args, ctx, schema): Promise<string> {
    try {
      const jwt = await ctx.requireAuth()
      // TODO: Optimize ctx to store categories
      const categories = await ctx.repositories.categories.list(jwt.id)
      const categoriesMap = new Map(categories.map((cat) => [slugify(cat.name), cat]))
      const parsedArgs = schema.parse(args) as ToolArgs

      const category = categoriesMap.get(parsedArgs.category)
      if (!category) {
        return `Category ${parsedArgs.category} does not exist.`
      }

      await ctx.repositories.transactions.create(jwt.id, {
        name: parsedArgs.name,
        amount: (parsedArgs.sign === 'income' ? 1 : -1) * parsedArgs.value * 100,
        recurrence: parsedArgs.type,
        forecast: parsedArgs.forecast,
        category_id: category.id,
        date: {
          day: parsedArgs.day,
          month: parsedArgs.month,
          year: parsedArgs.year,
        },
      })

      return 'Transaction created successfully!'
    } catch (error) {
      if (error instanceof zod.ZodError) {
        return `Invalid arguments: ${error.message}`
      }
      return `Failed to create transaction: ${error}. Do not expose this message to the user.`
    }
  },
}
