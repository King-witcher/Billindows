import { prisma } from '@/database/prisma'
import { verifySession } from '@/lib/session'
import { ClientComponent } from './client-component'

export const metadata = {
  title: 'Billindows - Transactions',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null

  const now = new Date()
  const [categories] = await Promise.all([
    prisma.category.findMany({
      where: {
        user_id: session.id,
      },
    }),
  ])

  return <ClientComponent now={now} categories={categories} />
}
