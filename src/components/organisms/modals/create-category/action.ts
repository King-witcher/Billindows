'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'

export async function createCategory(name: string) {
  const session = await verifySession()

  const color = `#${Math.floor(Math.random() * 2 ** 24)
    .toString(16)
    .padStart(6, '0')}`

  await prisma.category.create({
    data: {
      color,
      name,
      user_id: Number(session?.id),
    },
  })
}
