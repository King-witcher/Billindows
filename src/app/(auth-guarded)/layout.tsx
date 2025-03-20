import { deleteSession, verifySession } from '@/lib/session'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default async function Layout(props: Props) {
  const session = await verifySession()
  if (!session) return null

  async function logout() {
    'use server'
    await deleteSession()
  }

  return props.children
}
