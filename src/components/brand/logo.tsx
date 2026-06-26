import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Minimal "window with a highlighted pane" mark — bills + windows. */
export function LogoMark({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-6 text-primary', className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="6" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.5v17M3.5 12h17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="14" y="14" width="5.5" height="5.5" rx="2.2" fill="currentColor" />
    </svg>
  )
}

interface LogoProps extends ComponentProps<'div'> {
  showWordmark?: boolean
}

export function Logo({ className, showWordmark = true, ...props }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <LogoMark className="size-7" />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">Billindows</span>
      )}
    </div>
  )
}
