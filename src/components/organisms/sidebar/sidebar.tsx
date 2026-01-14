'use client'

import { Divider } from '@mui/material'
import { AlarmClock, ArrowLeftRight, Grid2X2Plus, LayoutDashboard } from 'lucide-react'
import { SidebarButton } from './button'

interface Props {
  onClose?(): void
}

export function SidebarContent(props: Props) {
  return (
    <>
      <SidebarButton url="/dashboard" onClick={props.onClose} icon={<LayoutDashboard />}>
        Dashboard
      </SidebarButton>
      <Divider />
      <SidebarButton url="/transactions" onClick={props.onClose} icon={<ArrowLeftRight />}>
        Transactions
      </SidebarButton>
      <Divider />
      <SidebarButton url="/categories" onClick={props.onClose} icon={<Grid2X2Plus />}>
        Categories
      </SidebarButton>
      <Divider />
      <SidebarButton icon={<AlarmClock />} disabled>
        Reminders
      </SidebarButton>
    </>
  )
}
