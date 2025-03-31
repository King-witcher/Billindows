'use server'

import { verifySession } from '@/lib/session'
import { getAllTxs } from '@/utils/queries/get-all-txs'
import { TxDto } from '@/utils/queries/get-one-time-txs'

export async function getTxs(year: number, month: number): Promise<TxDto[]> {
  const session = await verifySession()
  if (!session) return []

  return getAllTxs(session.id, year, month)
}
