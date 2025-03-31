'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
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
