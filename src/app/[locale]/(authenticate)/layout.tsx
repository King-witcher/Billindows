import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Logo } from '@/components/brand/logo'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { buildDefaultContainer } from '@/lib/injector/dependencies'

// Depends on the session cookie — always render per-request.
export const dynamic = 'force-dynamic'

interface Props {
  children: ReactNode
}

export default async function Layout(props: Props) {
  const ctx = buildDefaultContainer()
  const session = await ctx.authService.verifySession()
  if (session) redirect('/')

  const t = await getTranslations('auth')

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-muted p-4 sm:p-8">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 -left-1/4 size-150 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-1/4 -bottom-1/4 size-125 rounded-full bg-primary/8 blur-3xl" />
      </div>

      {/* Top bar with toggles */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
        <LanguageToggle />
        <ModeToggle />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Logo className="gap-2.5" />
          <p className="text-sm text-muted-foreground">{t('tagline')}</p>
        </div>
        <div className="w-full">{props.children}</div>
      </div>
    </div>
  )
}
