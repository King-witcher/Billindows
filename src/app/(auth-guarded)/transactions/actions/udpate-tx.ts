'use server'

import { CategoriesRepository } from '@/database/repositories/categories'
import { type Transaction, TransactionsRepository } from '@/database/repositories/transactions'
import { verifySession } from '@/lib/session'

export type UpdateTxParams = {
  id: number
  transaction: Transaction // The table to be edited is determined by the transaction type.
}

export async function updateTxAction({ id, transaction }: UpdateTxParams): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('Unauthorized')

  const txRepo = new TransactionsRepository()
  const catRepo = new CategoriesRepository(session.id)
  const category = await catRepo.getById(transaction.category_id)
  if (!category) throw new Error('Category not found')

  await txRepo.updateTransaction(id, transaction)
}
