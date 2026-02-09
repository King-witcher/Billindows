import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { buildDefaultContainer } from '@/lib/server-actions/dependencies'

interface Props {
  children: ReactNode
}

export default async function Layout(props: Props) {
  const ctx = buildDefaultContainer()
  const session = await ctx.authService.verifySession()
  if (session) redirect('/')

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-muted p-4 sm:p-8">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 -left-1/4 size-150 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 -bottom-1/4 size-125 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {props.children}
      </div>
    </div>
  )
}
