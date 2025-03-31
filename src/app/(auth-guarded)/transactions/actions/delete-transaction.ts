'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'

export async function deleteTransaction(id: number) {
  const session = await verifySession()
  if (!session) return

  await prisma.oneTimeTx.delete({
    where: {
      category: {
        user_id: session.id,
      },
      id,
    },
  })
}
