import { ClientComponent } from './client-component'
import { getTransactions } from './actions'

export default async function Page() {
  const transactions = await getTransactions()

  return <ClientComponent transactions={transactions} />
}
