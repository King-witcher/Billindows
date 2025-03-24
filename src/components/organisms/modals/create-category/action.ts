'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services'

export async function createCategory(name: string) {
  const session = await verifySession()

  const color = `#${Math.floor(Math.random() * 2 ** 24)
    .toString(16)
    .padStart(6, '0')}`

  await prisma.category.create({
    data: {
      color,
      name,
      userId: Number(session?.id),
    },
  })
}
