import { prisma } from '@/database/prisma'

export async function deleteTransaction(type: 'fixed' | 'one-time', id: number) {
  if (type === 'fixed') {
    await prisma.fixedTx.delete({
      where: {
        id,
      },
    })
  } else if (type === 'one-time') {
    await prisma.oneTimeTx.delete({
      where: {
        id,
      },
    })
  }
}
