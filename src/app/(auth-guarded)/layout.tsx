import { Sidebar } from '@/components/organisms'
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

  return (
    <div className="flex absolute w-dvw h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative">
        <div className="absolute inset-0">{props.children}</div>
      </div>
    </div>
  )
}
