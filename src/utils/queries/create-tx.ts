import { prisma } from '@/services/prisma'
import { DBTime } from '../time'
import { TxDto } from './get-one-time-txs'

export async function createTx(
  tx: Omit<TxDto, 'category' | 'id'>
): Promise<void> {
  const month = DBTime.fromYMToDB(tx.year, tx.month)

  if (tx.type === 'one-time') {
    await prisma.oneTimeTx.create({
      data: {
        month,
        day: tx.day,
        name: tx.name,
        value: tx.value,
        forecast: tx.forecast,
        category_id: tx.category_id,
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
        category_id: tx.category_id,
      },
    })
  }
}
