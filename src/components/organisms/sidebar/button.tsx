'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  children: string
  disabled?: boolean
  url?: string
}

export function SidebarButton({ icon, children, disabled, url }: Props) {
  return (
    <Link
      href={url || ''}
      className={`flex items-center gap-[10px] h-[50px] p-[20px] rounded-[4px] hover:bg-gray-100
        ${disabled ? ' opacity-50 pointer-events-none' : ''}`}
    >
      <span className="text-xl">{icon}</span> {children}
    </Link>
  )
}
