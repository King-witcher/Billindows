import { getFixedTxs } from './get-fixed-txs'
import { getOneTimeTxs, type TxDto } from './get-one-time-txs'

export async function getAllTxs(userId: number, year: number, month: number): Promise<TxDto[]> {
  const [fixed, oneTime] = await Promise.all([
    getFixedTxs(userId, year, month),
    getOneTimeTxs(userId, year, month),
  ])

  return [...fixed, ...oneTime]
}
