import { getAllTxs } from '@/utils/queries/get-all-txs'
import { ClientComponent } from './client-component'
import { verifySession } from '@/lib/session'

export const metadata = {
  title: 'Billindows - Transactions',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null

  const now = new Date()
  const transactions = await getAllTxs(
    session.id,
    now.getFullYear(),
    now.getMonth()
  )

  return <ClientComponent now={now} transactions={transactions} />
}
