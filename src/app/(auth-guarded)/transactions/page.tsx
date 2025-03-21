import { verifySession } from '@/lib/session'
import { prisma } from '@/services'
import { TransactionRow } from './transaction-row'

export default async function Page() {
  const session = await verifySession()

  const now = Date.now()
  const results: any[] = await prisma.$queryRaw`
    WITH c as (
      SELECT * FROM categories WHERE user_id = ${Number(session!.id)}
    )
    SELECT *
      FROM c INNER JOIN one_off_transactions t
        ON c.id = t.category_id
  `
  console.log(`Queried ${results.length} in ${Date.now() - now}ms.`)

  return (
    <div className="p-[20px] flex flex-col gap-[15px]">
      {results.map((result) => (
        <TransactionRow key={result.id} transaction={result} />
      ))}
    </div>
  )
}
