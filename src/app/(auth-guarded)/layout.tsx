import type { ReactNode } from 'react'
import { AppNavbar } from '@/components/app-navbar/app-navbar'
import { AssistantButton } from '@/components/organisms/assistant-button/assistant-button'
import { ChatProvider } from '@/contexts/chat-context'
import { UserProvider } from '@/contexts/user-context'
import { verifySession } from '@/lib/session'

interface Props {
  children: ReactNode
}

export default async function Layout(props: Props) {
  const session = await verifySession()

  if (!session) return null

  return (
    <UserProvider
      value={{
        email: session.email,
        name: session.name,
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
