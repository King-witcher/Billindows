import { verifySession } from '@/lib/session'
import { prisma } from '@/services'
import { CategoryRow } from './category-row'

export default async function Page() {
  const session = await verifySession()

  const results: any[] = await prisma.category.findMany({
    where: {
      userId: Number(session?.id),
    },
  })

  return (
    <div className="p-[20px]">
      <h1 className="text-5xl text-emerald-700">Transaction categories</h1>
      <main className="grid grid-cols-3 gap-y-[10px] mt-[30px]">
        <h2 className="text-2xl px-[20px]">Category</h2>
        <h2 className="text-2xl px-[20px] text-right">Goal</h2>
        {results.map((result) => (
          <CategoryRow key={result.id} category={result} />
        ))}
      </main>
    </div>
  )
}
