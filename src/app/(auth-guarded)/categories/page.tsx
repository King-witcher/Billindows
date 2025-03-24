import { verifySession } from '@/lib/session'
import { prisma } from '@/services'
import { ClientComponent } from './client-component'

export default async function Page() {
  const session = await verifySession()

  const results = await prisma.category.findMany({
    where: {
      user_id: Number(session?.id),
    },
  })

  return <ClientComponent categories={results} />
}
