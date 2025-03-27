import { SidebarContent } from '@/components/organisms'
import { Topbar } from '@/components/organisms/topbar/topbar'
import { UserProvider } from '@/contexts/user-context'
import { verifySession } from '@/lib/session'
import Paper from '@mui/material/Paper'
import { ReactNode } from 'react'

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
      <div className="flex flex-col absolute w-dvw h-dvh overflow-hidden">
        <Topbar />
        <div className="flex-1 flex">
          <Paper square className="w-[300px] hidden lg:block">
            <SidebarContent />
          </Paper>
          <div className="flex-1 relative">
            <div className="absolute inset-0 overflow-y-scroll overflow-x-hidden">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </UserProvider>
  )
}
