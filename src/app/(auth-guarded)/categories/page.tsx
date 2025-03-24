import { verifySession } from '@/lib/session'
import { prisma } from '@/services'
import { ClientComponent } from './client-component'

export default async function Page() {
  const session = await verifySession()

  const results = await prisma.category.findMany({
    where: {
      userId: Number(session?.id),
    },
  })

  return <ClientComponent results={results} />
}
