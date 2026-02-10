'use client'

import type { Category } from '@prisma/client'
import { Filter, Plus, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  categories: Category[]
  categoriesFilter: number[]
  onCategoriesFilterChange: (ids: number[]) => void
  showFuture: boolean
  onShowFutureChange: (show: boolean) => void
  showFixed: boolean
  onShowFixedChange: (show: boolean) => void
  onCreateClick: () => void
}

export function TransactionToolbar({
  categories,
  categoriesFilter,
  onCategoriesFilterChange,
  showFuture,
  onShowFutureChange,
  showFixed,
  onShowFixedChange,
  onCreateClick,
}: Props) {
  function toggleCategory(id: number) {
    if (categoriesFilter.includes(id)) {
      onCategoriesFilterChange(categoriesFilter.filter((c) => c !== id))
    } else {
      onCategoriesFilterChange([...categoriesFilter, id])
    }
  }

  return (
    <div className="flex items-stretch gap-2 lg:flex-col-reverse">
      {/* Include filters */}
      <div className="flex gap-2 flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1.5 lg:flex-1">
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Include</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Show transactions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={showFuture} onCheckedChange={onShowFutureChange}>
              Future transactions
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showFixed} onCheckedChange={onShowFixedChange}>
              Fixed transactions
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1.5 lg:flex-1">
              <Filter className="size-3.5" />
              <span className="hidden sm:inline">
                {categoriesFilter.length === 0
                  ? 'All categories'
                  : categoriesFilter.length === 1
                    ? (categories.find((c) => c.id === categoriesFilter[0])?.name ?? '1 category')
                    : `${categoriesFilter.length} categories`}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-70 lg:max-h-90 overflow-y-auto">
            <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={categoriesFilter.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              >
                <Badge color={category.color}>{category.name}</Badge>
              </DropdownMenuCheckboxItem>
            ))}
            {categoriesFilter.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={false}
                  onCheckedChange={() => onCategoriesFilterChange([])}
                >
                  Clear filters
                </DropdownMenuCheckboxItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Add button */}
      <Button onClick={onCreateClick} className="gap-1.5">
        <Plus className="size-4" />
        New
        <span className="hidden sm:inline">transaction</span>
      </Button>
    </div>
  )
}
