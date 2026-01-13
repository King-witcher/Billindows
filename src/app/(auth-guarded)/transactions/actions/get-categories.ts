'use server'

import type { Category } from '@prisma/client'
import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'

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
