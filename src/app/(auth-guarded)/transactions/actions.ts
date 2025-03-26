'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { ListedTransaction } from './transaction-row'
import { Category } from '@prisma/client'

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

export async function deleteTransaction(id: number) {
  const session = await verifySession()
  if (!session) return

  await prisma.oneOffTransaction.delete({
    where: {
      category: {
        user_id: session.id,
      },
      id,
    },
  })
}

export async function getCategories(): Promise<Category[]> {
  const session = await verifySession()
  if (!session) return []

  return await prisma.category.findMany({
    where: {
      user_id: {
        equals: session.id,
      },
    },
  })
}

export async function createTransaction(formData: FormData) {
  const session = await verifySession()
  if (!session) return

  const name = formData.get('name') as string
  let value = Number(formData.get('value'))
  const categoryId = Number(formData.get('category'))
  const type = formData.get('type') as string
  const date = Number(formData.get('date'))

  // Validation
  if (!name.length || name.length > 32) throw new Error('Invalid name')
  if (Number.isNaN(value) || value <= 0) throw new Error('Invalid value')
  if (Number.isNaN(categoryId) || categoryId < 0 || categoryId % 1 !== 0)
    throw new Error('Invalid category')
  if (!['income', 'expense'].includes(type)) throw new Error('Invalid type')
  if (Number.isNaN(date) || date < 0 || date % 1 !== 0) return

  if (type === 'expense') value = -value

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  })

  if (!category || category.user_id !== session.id)
    throw new Error('Invalid category')

  await prisma.oneOffTransaction.create({
    data: {
      date: new Date(date),
      name,
      value: value,
      category_id: categoryId,
    },
  })
}
