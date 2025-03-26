import { SidebarButton } from './button'
import { Divider, Paper } from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'

export function Sidebar() {
  return (
    <Paper square className="w-[300px]">
      <SidebarButton url="/dashboard" icon={<DashboardOutlinedIcon />}>
        Dashboard
      </SidebarButton>
      <Divider />
      <SidebarButton url="/transactions" icon={<ShoppingCartOutlinedIcon />}>
        Transactions
      </SidebarButton>
      <Divider />
      <SidebarButton url="/categories" icon={<CategoryOutlinedIcon />}>
        Categories
      </SidebarButton>
      <Divider />
      <SidebarButton icon={<NotificationsActiveOutlinedIcon />} disabled>
        Reminders
      </SidebarButton>
    </Paper>
  )
}
