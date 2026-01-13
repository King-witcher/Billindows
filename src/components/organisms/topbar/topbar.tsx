'use client'

import { AccountCircle } from '@mui/icons-material'
import MenuIcon from '@mui/icons-material/Menu'
import { Drawer, Menu, MenuItem } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { atom, useAtom } from 'jotai'
import { useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { SidebarContent } from '../sidebar'
import { logout } from './actions'

export const titleAtom = atom('Billindows')

export function Topbar() {
  const [title] = useAtom(titleAtom)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuAnchor, setAnchorEl] = useState<HTMLElement | null>(null)
  const user = useUser()

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <AppBar sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen((prev) => !prev)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <div className="flex items-center">
            <Typography>{user.name}</Typography>
            <IconButton size="large" color="inherit" onClick={handleClick}>
              <AccountCircle />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleClose}>
              <MenuItem onClick={logout}>Sign out</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        className="lg:hidden"
        slotProps={{
          paper: {
            className: 'w-full max-w-[280px]',
          },
        }}
      >
        <Toolbar />
        <SidebarContent onClose={() => setDrawerOpen(false)} />
      </Drawer>
      <Toolbar />
    </>
  )
}
