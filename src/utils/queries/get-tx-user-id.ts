import { prisma } from '@/services/prisma'

export async function getTxUserId(
  type: 'one-time' | 'fixed',
  id: number
): Promise<number> {
  const [{ user_id }]: [{ user_id: number }] =
    type === 'fixed'
      ? await prisma.$queryRaw`
          SELECT user_id
          FROM categories
          WHERE id = (
              SELECT category_id
              FROM fixed_txs
              WHERE id = ${id}
          );
        `
      : await prisma.$queryRaw`
          SELECT user_id
          FROM categories
          WHERE id = (
              SELECT category_id
              FROM one_time_txs
              WHERE id = ${id}
          );
        `

  return user_id
}
