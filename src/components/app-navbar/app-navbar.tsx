'use client'

import { ArrowLeftRight, Home, LayoutGrid, LogOut, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ComponentProps } from 'react'
import { Logo, LogoMark } from '@/components/brand/logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { useUser } from '@/contexts/user-context'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { logoutAction } from './actions'

type NavKey = 'home' | 'transactions' | 'categories'

const items: { key: NavKey; Icon: LucideIcon; url: string }[] = [
  { key: 'home', Icon: Home, url: '/dashboard' },
  { key: 'transactions', Icon: ArrowLeftRight, url: '/transactions' },
  { key: 'categories', Icon: LayoutGrid, url: '/categories' },
]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

export function AppNavbar({ className, ...props }: ComponentProps<'nav'>) {
  const user = useUser()
  const pathname = usePathname()
  const t = useTranslations('nav')
  const initials = getInitials(user.name)

  return (
    <nav
      className={cn('flex h-15 w-full items-center gap-1 border-b bg-card px-3 sm:px-4', className)}
      {...props}
    >
      <Link href="/dashboard" aria-label="Billindows" className="mr-2 flex items-center">
        <Logo className="hidden sm:flex" />
        <LogoMark className="size-7 sm:hidden" />
      </Link>

      <div className="flex items-center gap-0.5">
        {items.map((item) => {
          const selected = pathname.startsWith(item.url)
          return (
            <Button
              key={item.key}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                'gap-2 text-muted-foreground',
                selected && 'bg-accent text-accent-foreground',
              )}
            >
              <Link href={item.url}>
                <item.Icon className={cn('size-4', selected && 'stroke-[2.5]')} />
                <span className="hidden sm:inline">{t(item.key)}</span>
              </Link>
            </Button>
          )
        })}
      </div>

      <div className="ml-auto flex items-center gap-0.5">
        <LanguageToggle />
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label={user.name}>
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutAction()}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
