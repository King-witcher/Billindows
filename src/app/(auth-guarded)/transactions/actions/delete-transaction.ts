'use server'

import { verifySession } from '@/lib/session'
import { deleteTransaction } from '@/utils/queries/delete-transaction'
import { getTxUserId } from '@/utils/queries/get-tx-user-id'

export async function deleteTransactionAction(type: 'one-time' | 'fixed', id: number) {
  const session = await verifySession()
  if (!session) {
    console.error('unauthenticated')
    return
  }

  const userId = await getTxUserId(type, id)

  if (userId !== session.id) {
    console.error('wrong user')
    return
  }

  await deleteTransaction(type, id)
}
