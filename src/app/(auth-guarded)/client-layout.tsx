import { Sidebar } from '@/components/organisms/sidebar/sidebar'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function ClientLayout({ children }: Props) {
  return (
    <div className="flex absolute w-dvw h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex-1 relative">
        <div className="absolute inset-0">{children}</div>
      </div>
    </div>
  )
}
