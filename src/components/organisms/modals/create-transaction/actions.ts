'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services'
import { Category } from '@prisma/client'

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

  if (!name.length || name.length > 32) throw new Error('Invalid name')
  if (Number.isNaN(value) || value < 0) throw new Error('Invalid value')
  if (Number.isNaN(categoryId) || categoryId < 0 || categoryId % 1 !== 0)
    throw new Error('Invalid category')
  if (!['income', 'expense'].includes(type)) throw new Error('Invalid type')

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
      date: new Date(),
      name,
      value: value,
      category_id: categoryId,
    },
  })
}
