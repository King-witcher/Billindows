import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { buildDefaultContainer } from '@/lib/server-actions/dependencies'

interface Props {
  children: ReactNode
}

export default async function Layout(props: Props) {
  const ctx = buildDefaultContainer()
  const session = await ctx.authService.verifySession()
  if (session) redirect('/')

  return (
    <div className="w-dvw h-dvh flex items-center justify-center p-5">
      <Card className="p-10 w-95 max-w-full flex flex-col gap-5 items-center">
        {props.children}
      </Card>
    </div>
  )
}
