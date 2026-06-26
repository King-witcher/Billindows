import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { sanitizeColor } from '@/utils/utils'

interface Props extends ComponentProps<'span'> {
  /** Category hex color (#RRGGBB). Drives the dot, tint and text color. */
  color: string
}

/**
 * Category pill. Text color is mixed toward the current `--foreground`, so it
 * stays legible in both light and dark mode regardless of the category hue.
 */
export function Badge({ color, className, children, ...props }: Props) {
  const c = sanitizeColor(color)

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 truncate rounded-full border px-2 py-0.5 text-xs font-medium',
        className,
      )}
      style={{
        color: `color-mix(in oklab, ${c} 72%, var(--foreground))`,
        borderColor: `color-mix(in oklab, ${c} 35%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${c} 14%, transparent)`,
      }}
      {...props}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: c }}
        aria-hidden="true"
      />
      <span className="truncate">{children}</span>
    </span>
  )
}
