import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppNavbar } from '@/components/app-navbar/app-navbar'
import { Chat } from '@/components/organisms/chat/chat'
import { ChatProvider } from '@/contexts/chat/chat-context'
import { UserProvider } from '@/contexts/user-context'
import { buildDefaultContainer } from '@/lib/injector/dependencies'

interface Props {
  children: ReactNode
}

export default async function Layout(props: Props) {
  const ctx = buildDefaultContainer()
  const jwt = await ctx.authService.verifySession()
  if (!jwt) redirect('/login')

  return (
    <UserProvider
      value={{
        email: jwt.email,
        name: jwt.name,
      }}
    >
      <ChatProvider>
        <div className="flex flex-col h-screen">
          <AppNavbar className="shrink-0" />
          <main className="flex flex-1">
            <div className="flex-1 relative bg-blue">
              <div className="absolute inset-0 overflow-y-auto">{props.children}</div>
            </div>
            <Chat className="hidden xl:block" />
          </main>
        </div>
      </ChatProvider>
    </UserProvider>
  )
}
