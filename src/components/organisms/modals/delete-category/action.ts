'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services'

export async function deleteCategory(id: number) {
  const session = await verifySession()

  const category = await prisma.category.findUnique({
    where: {
      id,
    },
  })

  if (!category) {
    console.error('failed to delete')
    return
  }

  if (category.userId !== Number(session?.id)) {
    console.error('wrong ownership')
    return
  }

  await prisma.category.delete({
    where: {
      id,
    },
  })
}
