'use client'

import { ListFilter, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/atoms/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CategoryRow } from '@/lib/database/types'
import { cn } from '@/lib/utils'

export type TypeFilter = 'all' | 'income' | 'expense'

export type Filters = {
  type: TypeFilter
  showFixed: boolean
  showOneTime: boolean
  showInForecast: boolean
  showOutForecast: boolean
  showFuture: boolean
  categories: string[]
}

export const DEFAULT_FILTERS: Filters = {
  type: 'all',
  showFixed: true,
  showOneTime: true,
  showInForecast: true,
  showOutForecast: true,
  showFuture: true,
  categories: [],
}

/** Number of secondary filters (everything except the always-visible type segment) deviating from default. */
export function activeFilterCount(f: Filters): number {
  return (
    Number(!f.showFixed) +
    Number(!f.showOneTime) +
    Number(!f.showInForecast) +
    Number(!f.showOutForecast) +
    Number(!f.showFuture) +
    (f.categories.length > 0 ? 1 : 0)
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-border bg-transparent text-muted-foreground hover:bg-accent',
      )}
    >
      {children}
    </button>
  )
}

type Props = {
  search: string
  onSearchChange: (value: string) => void
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  categories: CategoryRow[]
}

export function TransactionsFilters({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  categories,
}: Props) {
  const t = useTranslations('transactions')
  const tf = useTranslations('transactions.filters')

  const count = activeFilterCount(filters)

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onFiltersChange({ ...filters, [key]: value })
  }

  function toggleCategory(id: string) {
    const next = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id]
    set('categories', next)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {/* Search */}
      <InputGroup className="sm:flex-1">
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <InputGroupAddon align="inline-end">
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label={tf('clear')}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </InputGroupAddon>
        )}
      </InputGroup>

      <div className="flex items-center gap-2">
        {/* Type segment */}
        <Tabs value={filters.type} onValueChange={(v) => set('type', v as TypeFilter)}>
          <TabsList>
            <TabsTrigger value="all">{tf('all')}</TabsTrigger>
            <TabsTrigger value="income">{tf('income')}</TabsTrigger>
            <TabsTrigger value="expense">{tf('expenses')}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters panel */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-1.5">
              <ListFilter className="size-4" />
              <span className="hidden sm:inline">{tf('button')}</span>
              {count > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
                  {count}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <div className="flex flex-col gap-4">
              <FilterSection title={tf('recurrence')}>
                <Chip
                  active={filters.showFixed}
                  onClick={() => set('showFixed', !filters.showFixed)}
                >
                  {tf('fixed')}
                </Chip>
                <Chip
                  active={filters.showOneTime}
                  onClick={() => set('showOneTime', !filters.showOneTime)}
                >
                  {tf('oneTime')}
                </Chip>
              </FilterSection>

              <FilterSection title={tf('forecast')}>
                <Chip
                  active={filters.showInForecast}
                  onClick={() => set('showInForecast', !filters.showInForecast)}
                >
                  {tf('forecasted')}
                </Chip>
                <Chip
                  active={filters.showOutForecast}
                  onClick={() => set('showOutForecast', !filters.showOutForecast)}
                >
                  {tf('notForecasted')}
                </Chip>
              </FilterSection>

              <FilterSection title={tf('timing')}>
                <Chip
                  active={filters.showFuture}
                  onClick={() => set('showFuture', !filters.showFuture)}
                >
                  {tf('futureShort')}
                </Chip>
              </FilterSection>

              {categories.length > 0 && (
                <FilterSection title={tf('categories')}>
                  <div className="-mr-1 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto pr-1">
                    {categories.map((category) => {
                      const selected = filters.categories.includes(category.id)
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          aria-pressed={selected}
                          className={cn(
                            'rounded-full transition-opacity',
                            selected
                              ? 'opacity-100 ring-2 ring-primary/40'
                              : 'opacity-55 hover:opacity-100',
                          )}
                        >
                          <Badge color={category.color}>{category.name}</Badge>
                        </button>
                      )
                    })}
                  </div>
                </FilterSection>
              )}

              {count > 0 && (
                <>
                  <Separator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start text-muted-foreground"
                    onClick={() => onFiltersChange({ ...DEFAULT_FILTERS, type: filters.type })}
                  >
                    <X className="size-4" /> {tf('clear')}
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
