'use client'

import { Filter, Plus, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
import type { CategoryRow } from '@/lib/database/types'

interface Props {
  categories: CategoryRow[]
  categoriesFilter: string[]
  onCategoriesFilterChange: (ids: string[]) => void
  showFuture: boolean
  onShowFutureChange: (show: boolean) => void
  showFixed: boolean
  onShowFixedChange: (show: boolean) => void
  showOneTime: boolean
  onShowOneTimeChange: (show: boolean) => void
  showForecasted: boolean
  onShowForecastedChange: (show: boolean) => void
  showNotForecasted: boolean
  onShowNotForecastedChange: (show: boolean) => void
  showIncome: boolean
  onShowIncomeChange: (show: boolean) => void
  showExpenses: boolean
  onShowExpensesChange: (show: boolean) => void
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
  showOneTime,
  onShowOneTimeChange,
  showForecasted,
  onShowForecastedChange,
  showNotForecasted,
  onShowNotForecastedChange,
  showIncome,
  onShowIncomeChange,
  showExpenses,
  onShowExpensesChange,
  onCreateClick,
}: Props) {
  const t = useTranslations('transactions')
  const tf = useTranslations('transactions.filters')

  function toggleCategory(id: string) {
    if (categoriesFilter.includes(id)) {
      onCategoriesFilterChange(categoriesFilter.filter((c) => c !== id))
    } else {
      onCategoriesFilterChange([...categoriesFilter, id])
    }
  }

  const categoryLabel =
    categoriesFilter.length === 0
      ? tf('allCategories')
      : categoriesFilter.length === 1
        ? (categories.find((c) => c.id === categoriesFilter[0])?.name ?? tf('allCategories'))
        : tf('categoriesCount', { count: categoriesFilter.length })

  return (
    <div className="flex items-stretch gap-2 lg:flex-col-reverse">
      <div className="flex flex-1 gap-2">
        {/* Include filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1.5 lg:flex-1">
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">{tf('include')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>{tf('show')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={showFuture} onCheckedChange={onShowFutureChange}>
              {tf('future')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={showFixed} onCheckedChange={onShowFixedChange}>
              {tf('fixed')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showOneTime} onCheckedChange={onShowOneTimeChange}>
              {tf('oneTime')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showForecasted}
              onCheckedChange={onShowForecastedChange}
            >
              {tf('forecasted')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showNotForecasted}
              onCheckedChange={onShowNotForecastedChange}
            >
              {tf('notForecasted')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={showIncome} onCheckedChange={onShowIncomeChange}>
              {tf('income')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showExpenses} onCheckedChange={onShowExpensesChange}>
              {tf('expenses')}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Category filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1.5 lg:flex-1">
              <Filter className="size-3.5" />
              <span className="hidden truncate sm:inline">{categoryLabel}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-70 overflow-y-auto lg:max-h-90">
            <DropdownMenuLabel>{tf('filterByCategory')}</DropdownMenuLabel>
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
                  {tf('clear')}
                </DropdownMenuCheckboxItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1" />

      {/* Add button */}
      <Button onClick={onCreateClick} className="gap-1.5">
        <Plus className="size-4" />
        <span className="hidden sm:inline">{t('newTransaction')}</span>
        <span className="sm:hidden">{t('new')}</span>
      </Button>
    </div>
  )
}
