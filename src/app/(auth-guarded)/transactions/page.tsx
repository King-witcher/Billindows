import { getTransactions } from './actions'
import { ClientComponent } from './client-component'

export const metadata = {
  title: 'Billindows - Transactions',
}

export default async function Page() {
  const transactions = await getTransactions()
  const now = new Date()

  return <ClientComponent now={now} transactions={transactions} />
}
