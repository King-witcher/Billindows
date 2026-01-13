'use client'

import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { Divider } from '@mui/material'
import { SidebarButton } from './button'

interface Props {
  onClose?(): void
}

export function SidebarContent(props: Props) {
  return (
    <>
      <SidebarButton url="/dashboard" onClick={props.onClose} icon={<DashboardOutlinedIcon />}>
        Dashboard
      </SidebarButton>
      <Divider />
      <SidebarButton
        url="/transactions"
        onClick={props.onClose}
        icon={<ShoppingCartOutlinedIcon />}
      >
        Transactions
      </SidebarButton>
      <Divider />
      <SidebarButton url="/categories" onClick={props.onClose} icon={<CategoryOutlinedIcon />}>
        Categories
      </SidebarButton>
      <Divider />
      <SidebarButton icon={<NotificationsActiveOutlinedIcon />} disabled>
        Reminders
      </SidebarButton>
    </>
  )
}
