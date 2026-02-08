'use client'

import { Paintbrush, RefreshCw } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#78716c',
  '#64748b',
  '#1e293b',
]

type Props = {
  value: string
  onChange: (color: string) => void
  onRandomize?: () => void
}

export function ColorPicker({ value, onChange, onRandomize }: Props) {
  const [open, setOpen] = useState(false)
  const nativeInputRef = useRef<HTMLInputElement>(null)

  const handlePresetClick = useCallback(
    (color: string) => {
      onChange(color)
      setOpen(false)
    },
    [onChange],
  )

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (raw.match(/^#[0-9a-fA-F]{0,6}$/)) {
        onChange(raw)
      }
    },
    [onChange],
  )

  const handleNativeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3 font-normal">
          <div className="size-4 shrink-0 rounded-full border" style={{ backgroundColor: value }} />
          <span className="font-mono text-xs uppercase">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-3" align="start">
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                'size-8 rounded-full border-2 transition-transform hover:scale-110 focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 outline-none',
                value.toLowerCase() === color.toLowerCase()
                  ? 'border-foreground scale-110'
                  : 'border-transparent',
              )}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetClick(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="size-8 shrink-0 rounded-md border" style={{ backgroundColor: value }} />
          <Input
            value={value}
            onChange={handleHexInput}
            placeholder="#000000"
            className="font-mono text-xs h-8"
            maxLength={7}
          />
          {onRandomize && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRandomize}
              aria-label="Random color"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => nativeInputRef.current?.click()}
            aria-label="Pick custom color"
          >
            <Paintbrush className="size-3.5" />
          </Button>
          <input
            ref={nativeInputRef}
            type="color"
            value={value.match(/^#[0-9a-fA-F]{6}$/) ? value : '#000000'}
            onChange={handleNativeChange}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
