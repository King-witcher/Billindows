'use server'

import { verifySession } from '@/lib/session'
import { getAllTxs } from '@/utils/queries/get-all-txs'

export async function getTransactions(now: Date) {
  const session = await verifySession()
  if (!session) return []

  return getAllTxs(session.id, now.getFullYear(), now.getMonth()).then(
    (results) => {
      return results.sort((a, b) => {
        if (a.day === b.day) return b.id - a.id
        return a.day - b.day
      })
    }
  )
}
