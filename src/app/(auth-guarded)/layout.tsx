import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppNavbar } from '@/components/app-navbar/app-navbar'
import { AssistantButton } from '@/components/organisms/assistant-button/assistant-button'
import { ChatProvider } from '@/contexts/chat-context'
import { UserProvider } from '@/contexts/user-context'
import { buildDefaultContainer } from '@/lib/server-actions/dependencies'

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
          <main className="flex-1 relative">
            <div className="absolute inset-0 overflow-y-auto">{props.children}</div>
          </main>
          <AssistantButton />
        </div>
      </ChatProvider>
    </UserProvider>
  )
}
