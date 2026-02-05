'use server'

import { CategoriesRepository } from '@/database/repositories/categories'
import { type Transaction, TransactionsRepository } from '@/database/repositories/transactions'
import { verifySession } from '@/lib/session'

export async function createTxAction(data: Transaction): Promise<void> {
  const session = await verifySession()
  if (!session) throw new Error('Unauthorized')

  const txRepo = new TransactionsRepository()
  const catRepo = new CategoriesRepository(session.id)
  const category = await catRepo.getById(data.category_id)
  if (!category) throw new Error('Category not found')

  await txRepo.create(data)
}
