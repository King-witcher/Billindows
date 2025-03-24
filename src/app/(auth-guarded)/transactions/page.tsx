import { getTransactions } from './actions'
import { ClientComponent } from './client-component'

export default async function Page() {
  const transactions = await getTransactions()

  return <ClientComponent transactions={transactions} />
}
