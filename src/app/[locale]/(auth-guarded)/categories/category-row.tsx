'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/atoms/badge'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { CategoryRow } from '@/lib/database/types'

interface Props {
  category: CategoryRow
  onEdit: (category: CategoryRow) => void
  onDelete: (category: CategoryRow) => void
}

export function CategoryItem({ category, onDelete, onEdit }: Props) {
  return (
    <TableRow>
      <TableCell className="max-w-45 sm:max-w-75">
        <Badge color={category.color}>{category.name}</Badge>
      </TableCell>
      <TableCell className="hidden text-center sm:table-cell">
        <CurrencyText value={category.goal} showSign />
      </TableCell>
      <TableCell className="w-0 whitespace-nowrap text-right">
        <div className="flex justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(category)}
                aria-label="Edit category"
              >
                <Pencil />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(category)}
                aria-label="Delete category"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  )
}
