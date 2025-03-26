'use client'

import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import { atom, useAtom } from 'jotai'
import { AccountCircle } from '@mui/icons-material'
import { useState } from 'react'
import { Menu, MenuItem } from '@mui/material'
import { useUser } from '@/contexts/user-context'
import { deleteSession } from '@/lib/session'
import { logout } from './actions'

export const titleAtom = atom('Billindows')

export function Topbar() {
  const [title] = useAtom(titleAtom)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const user = useUser()

  function handleClick(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
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
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={logout}>Sign out</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  )
}
