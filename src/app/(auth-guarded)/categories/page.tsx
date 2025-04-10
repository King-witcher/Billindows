import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { ClientComponent } from './client-component'

export const metadata = {
  title: 'Billindows - Categories',
}

export default async function Page() {
  const session = await verifySession()

  const results = await prisma.category
    .findMany({
      where: {
        user_id: session!.id,
      },
    })
    .then((results) => results.sort((a, b) => a.name.localeCompare(b.name)))

  return <ClientComponent categories={results} />
}
