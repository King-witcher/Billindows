'use server'

import { prisma } from '@/database/prisma'
import { verifySession } from '@/lib/session'

export async function deleteCategory(id: number) {
  const session = await verifySession()
  if (!session) return

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  })

  if (!category) {
    console.error("couldn't find category")
    return
  }

  if (category.user_id !== Number(session?.id)) {
    console.error('wrong owner')
    return
  }

  await prisma.category.delete({
    where: {
      id,
    },
  })
}
