'use client'

import { TooltipPortal, TooltipTrigger } from '@radix-ui/react-tooltip'
import {
  ArrowLeftRightIcon,
  CogIcon,
  CreditCardIcon,
  HomeIcon,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  User2,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent } from '../ui/tooltip'
import { logoutAction } from './actions'

type Item = {
  label: string
  Icon: LucideIcon
  url: string
}

const items: Item[] = [
  {
    label: 'Home',
    Icon: HomeIcon,
    url: '/dashboard',
  },
  {
    label: 'Transactions',
    Icon: ArrowLeftRightIcon,
    url: '/transactions',
  },
  {
    label: 'Categories',
    Icon: LayoutDashboard,
    url: '/categories',
  },
]

export function AppNavbar({ className, ...props }: ComponentProps<'nav'>) {
  const user = useUser()
  const path = usePathname()

  return (
    <nav
      className={cn(
        'bg-white flex gap-2 items-center w-full border-b px-4 h-15 shadow-xs',
        className,
      )}
      {...props}
    >
      {items.map((item) => {
        const selected = path.startsWith(item.url)

        return (
          <Button
            key={item.label}
            variant="ghost"
            size="icon-md-default"
            className={cn('flex items-center gap-2', selected && 'font-bold')}
            asChild
          >
            <a href={item.url} title={item.label}>
              <item.Icon className={selected ? 'stroke-3' : undefined} />
              <span className="hidden md:inline-block">{item.label}</span>
            </a>
          </Button>
        )
      })}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            'ml-auto flex gap-2 p-2 md:py-1 rounded-lg items-center',
            'hover:bg-muted cursor-pointer',
          )}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src="https://github.com/king-witcher.png" alt={user.name} />
          </Avatar>
          <div className="hidden md:flex flex-col items-start text-left w-full">
            <span className="text-sm font-medium truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src="https://github.com/king-witcher.png" alt={user.name} />
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate w-45">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate w-45">{user.email}</span>
            </div>
          </div>
          <DropdownMenuSeparator />

          {/* Profile */}
          <Tooltip>
            <TooltipPortal>
              <TooltipContent>This is just a placeholder</TooltipContent>
            </TooltipPortal>
            <TooltipTrigger asChild>
              <DropdownMenuItem>
                <User2 className="mr-2 size-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </TooltipTrigger>
          </Tooltip>

          {/* Billing */}
          <Tooltip>
            <TooltipPortal>
              <TooltipContent>This is just a placeholder</TooltipContent>
            </TooltipPortal>
            <TooltipTrigger asChild>
              <DropdownMenuItem>
                <CreditCardIcon className="mr-2 size-4" />
                <span>Billing</span>
              </DropdownMenuItem>
            </TooltipTrigger>
          </Tooltip>

          {/* Settings */}
          <Tooltip>
            <TooltipPortal>
              <TooltipContent>This is just a placeholder</TooltipContent>
            </TooltipPortal>
            <TooltipTrigger asChild>
              <DropdownMenuItem>
                <CogIcon className="mr-2 size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </TooltipTrigger>
          </Tooltip>

          {/* Logout */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logoutAction}>
            <LogOut className="mr-2 size-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
