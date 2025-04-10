import { verifySession } from '@/lib/session'
import { getAllTxs } from '@/utils/queries/get-all-txs'
import { ClientComponent } from './client-component'
import { prisma } from '@/services/prisma'

export const metadata = {
  title: 'Billindows - Transactions',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null

  const now = new Date()
  const [transactions, categories] = await Promise.all([
    getAllTxs(session.id, now.getFullYear(), now.getMonth()).then((results) => {
      return results.sort((a, b) => {
        if (a.day === b.day) return b.id - a.id
        return a.day - b.day
      })
    }),
    prisma.category.findMany({
      where: {
        user_id: session.id,
      },
    }),
  ])

  return (
    <ClientComponent
      now={now}
      transactions={transactions}
      categories={categories}
    />
  )
}
