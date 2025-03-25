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
  const year = Number(formData.get('year'))
  const month = Number(formData.get('month'))
  const day = Number(formData.get('day'))

  // Validation
  if (!name.length || name.length > 32) throw new Error('Invalid name')
  if (Number.isNaN(value) || value <= 0) throw new Error('Invalid value')
  if (Number.isNaN(categoryId) || categoryId < 0 || categoryId % 1 !== 0)
    throw new Error('Invalid category')
  if (!['income', 'expense'].includes(type)) throw new Error('Invalid type')
  if (Number.isNaN(year)) throw new Error('Invalid year')
  if (Number.isNaN(month)) throw new Error('Invalid month')
  if (Number.isNaN(day)) throw new Error('Invalid day')

  console.log(year, month, day, new Date(year, month, day))

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
      date: new Date(year, month, day),
      name,
      value: value,
      category_id: categoryId,
    },
  })
}
