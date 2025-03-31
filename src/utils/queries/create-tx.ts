import { prisma } from '@/services/prisma'
import { DBTime } from '../time'
import { TxDto } from './get-one-time-txs'

export async function createTx(
  categoryId: number,
  tx: Omit<TxDto, 'category' | 'id'>
): Promise<void> {
  const month = DBTime.getMonthByYearAndMonth(tx.year, tx.month)

  if (tx.type === 'one-time') {
    await prisma.oneTimeTx.create({
      data: {
        month,
        day: tx.day,
        name: tx.name,
        value: tx.value,
        category_id: categoryId,
      },
    })
  } else if (tx.type === 'fixed') {
    await prisma.fixedTx.create({
      data: {
        start_month: month,
        end_month: null,
        day: tx.day,
        name: tx.name,
        value: tx.value,
        category_id: categoryId,
      },
    })
  }
}
