'use client'

import { CircleSlash, MoreHorizontal, Pencil, Repeat, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import { Badge } from '@/components/atoms/badge'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { AbstractTransaction, CategoryRow } from '@/lib/database/types'
import { cn } from '@/lib/utils'

interface Props {
  transaction: AbstractTransaction
  category: CategoryRow
  isFuture: boolean
  onEdit: (tx: AbstractTransaction) => void
  onDelete: (tx: AbstractTransaction) => void
  onEndRecurrence: (tx: AbstractTransaction) => void
}

export function TransactionCard({
  transaction,
  category,
  isFuture,
  onEdit,
  onDelete,
  onEndRecurrence,
}: Props) {
  const t = useTranslations('transactions')
  const isFixed = transaction.recurrence === 'fixed'
  const isEnded = Boolean(transaction.ended)
  const excludedFromForecast = transaction.recurrence === 'one-time' && !transaction.forecast

  // Guard against "ghost clicks": only open edit when the pointer actually went
  // down on the card (not on a closing dropdown/dialog overlay above it).
  const pointerDownInside = useRef(false)

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={() => {
        pointerDownInside.current = true
      }}
      onClick={() => {
        if (pointerDownInside.current) onEdit(transaction)
        pointerDownInside.current = false
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onEdit(transaction)
      }}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-2.5 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isFuture && 'opacity-60',
      )}
    >
      {/* Name + category */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="truncate text-sm font-medium">{transaction.name}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge color={category.color}>{category.name}</Badge>
          {isEnded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="rounded-full border border-dashed px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {t('ended')}
                </span>
              </TooltipTrigger>
              <TooltipContent>{t('endedTooltip')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Indicators + value */}
      <div className="flex shrink-0 items-center gap-1.5">
        {isFixed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Repeat className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>{t('fixedTooltip')}</TooltipContent>
          </Tooltip>
        )}
        {excludedFromForecast && (
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleSlash className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>{t('notInForecast')}</TooltipContent>
          </Tooltip>
        )}
        <CurrencyText value={transaction.amount} className="text-sm font-semibold" />
      </div>

      {/* Actions */}
      <div
        className="shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">{t('edit')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil className="mr-2 size-4" />
              {t('edit')}
            </DropdownMenuItem>
            {isFixed && !isEnded && (
              <DropdownMenuItem onClick={() => onEndRecurrence(transaction)}>
                <CircleSlash className="mr-2 size-4" />
                {t('endRecurrence')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(transaction)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
