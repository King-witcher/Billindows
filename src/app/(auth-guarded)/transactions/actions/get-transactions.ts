'use server'

import { verifySession } from '@/lib/session'
import { TxDto } from '@/utils/queries/get-one-time-txs'
import { getAllTxs } from '@/utils/queries/get-all-txs'

export async function getTxs(): Promise<TxDto[]> {
  const session = await verifySession()
  if (!session) return []

  const now = new Date()
  return getAllTxs(session.id, now.getFullYear(), now.getMonth())
}
