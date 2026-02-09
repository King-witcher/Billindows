'use client'

import type { Category } from '@prisma/client'
import { MoreHorizontal, Pencil, Repeat, Trash2 } from 'lucide-react'
import type { MouseEvent } from 'react'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Transaction } from '@/database/repositories/transactions'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/utils'

interface Props {
  transaction: Transaction
  category: Category
  isFuture: boolean
  onEdit: (tx: Transaction) => void
  onDelete: (tx: Transaction) => void
}

export function TransactionCard({ transaction, category, isFuture, onEdit, onDelete }: Props) {
  function handleMenuClick(e: MouseEvent) {
    e.stopPropagation()
  }

  return (
    <button
      type="button"
      onClick={() => onEdit(transaction)}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isFuture && 'opacity-50',
      )}
    >
      {/* Color indicator */}
      <div
        className="hidden size-2 shrink-0 rounded-full sm:block"
        style={{ backgroundColor: category.color }}
      />

      {/* Name + category */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <span className="truncate text-sm font-medium">{transaction.name}</span>
        <Badge color={category.color}>{category.name}</Badge>
      </div>

      {/* Value */}
      <div className="flex shrink-0 items-center gap-1.5">
        {transaction.type === 'fixed' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Repeat className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>Fixed transaction</TooltipContent>
          </Tooltip>
        )}
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            transaction.value < 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-emerald-600 dark:text-emerald-400',
          )}
        >
          {formatMoney(transaction.value)}
        </span>
      </div>

      {/* Actions */}
      {/* biome-ignore lint/a11y/useSemanticElements: stop propagation wrapper */}
      <div
        role="group"
        onClick={handleMenuClick}
        onKeyDown={(e) => e.stopPropagation()}
        className="shrink-0"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(transaction)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </button>
  )
}
