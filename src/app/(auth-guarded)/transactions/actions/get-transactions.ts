'use server'

import { verifySession } from '@/lib/session'
import { getAllTxs } from '@/utils/queries/get-all-txs'
import type { TxDto } from '@/utils/queries/get-one-time-txs'

export async function getTxs(): Promise<TxDto[]> {
  const session = await verifySession()
  if (!session) return []

  const now = new Date()
  return getAllTxs(session.id, now.getFullYear(), now.getMonth())
}
