'use server'

import type { Category } from '@prisma/client'
import { prisma } from '@/database/prisma'
import { verifySession } from '@/lib/session'

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
