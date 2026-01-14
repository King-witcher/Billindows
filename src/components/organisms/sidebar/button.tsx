'use client'

import { Typography } from '@mui/material'
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { Label } from '@/components/ui/label'

interface Props extends Omit<ComponentProps<typeof Link>, 'href'> {
  icon: ReactNode
  children: string
  disabled?: boolean
  url?: string
}

export function SidebarButton({ icon, children, disabled, url, ...rest }: Props) {
  return (
    <Link
      href={url || ''}
      className={`flex items-center gap-[10px] h-[50px] p-[20px] rounded-[4px] hover:bg-gray-100
        ${disabled ? ' opacity-50 pointer-events-none' : ''}`}
      {...rest}
    >
      {icon}
      <p className="font-medium text-sm">{children}</p>
    </Link>
  )
}
