'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { ListedTransaction } from './transaction-row'

type QueryType = {
  id: number
  name: string
  value: number
  date: Date
  category_color: string
  category_name: string
}

export async function getTransactions(): Promise<ListedTransaction[]> {
  const session = await verifySession()

  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const rows: QueryType[] = await prisma.$queryRaw`
      WITH c as (
        SELECT * FROM categories WHERE user_id = ${Number(session!.id)}
      )
      SELECT t.id, t.name, t.value, t.date, c.color as category_color, c.name as category_name
        FROM c INNER JOIN one_off_transactions t
          ON c.id = t.category_id
        WHERE t.date >= ${firstDayOfMonth}
    `

  console.log(`Queried ${rows.length} in ${Date.now() - now.getTime()}ms.`)

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    value: row.value,
    category: {
      name: row.category_name,
      color: row.category_color,
    },
    date: row.date,
  }))
}
