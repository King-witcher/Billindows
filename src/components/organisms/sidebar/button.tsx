import { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  children: string
  disabled?: boolean
}

export function SidebarButton({ icon, children, disabled }: Props) {
  return (
    <div
      className={`flex items-center gap-[10px] h-[50px] p-[20px] rounded-[4px] hover:bg-gray-100${disabled ? ' opacity-50 pointer-events-none' : ''}`}
    >
      <span className="text-xl">{icon}</span> {children}
    </div>
  )
}
