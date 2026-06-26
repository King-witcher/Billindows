import { buildDefaultContainer } from '@/lib/injector/dependencies'
import { ClientComponent } from './client-component'

export const metadata = {
  title: 'Billindows - Categories',
}

export default async function Page() {
  const deps = buildDefaultContainer()
  const jwt = await deps.requireAuth()
  const categories = await deps.repositories.categories.list(jwt.id)

  return <ClientComponent initialCategories={categories} />
}
