import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  params: Promise<{ referrer: string }>
}

export default async function Layout(props: Props) {
  const session = await verifySession()
  const seacrhParams = await props.params
  const referrer = seacrhParams.referrer ?? '/'

  if (session) redirect(referrer)

  return props.children
}
