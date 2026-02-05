'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/utils'
import type { CategoryAnalysis } from '../helpers'

type CategoryTableProps = {
  categories: CategoryAnalysis[]
}

function ColorBadge({ color }: { color: string }) {
  return <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const sortedCategories = [...categories].sort((a, b) => a.actualBalance - b.actualBalance)

  if (sortedCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis by Category</CardTitle>
          <CardDescription>Complete breakdown of each category</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-50 text-muted-foreground">
          No categories found
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis by Category</CardTitle>
        <CardDescription>Complete breakdown of each category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Category</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Fixed</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">One-time</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Balance</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Forecast</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground min-w-30">
                  Goal
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((cat) => (
                <tr
                  key={cat.category.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <ColorBadge color={cat.category.color} />
                      <span className="font-medium">{cat.category.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 text-muted-foreground">
                    {formatMoney(cat.fixedBalance)}
                  </td>
                  <td className="text-right py-3 px-2 text-muted-foreground">
                    {formatMoney(cat.oneTimeBalance)}
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-2 font-medium',
                      cat.actualBalance >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400',
                    )}
                  >
                    {formatMoney(cat.actualBalance)}
                  </td>
                  <td
                    className={cn(
                      'text-right py-3 px-2',
                      cat.forecastBalance >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400',
                    )}
                  >
                    {formatMoney(cat.forecastBalance)}
                  </td>
                  <td className="py-3 px-2">
                    {cat.category.goal ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {cat.progress !== null
                              ? `${Math.abs(cat.progress * 100).toFixed(0)}%`
                              : '-'}
                          </span>
                          <span className="text-muted-foreground">
                            {formatMoney(cat.category.goal)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(Math.abs((cat.progress || 0) * 100), 100)}
                          className="h-1.5"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No goal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

type CategoryCardsProps = {
  categories: CategoryAnalysis[]
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  const sortedCategories = [...categories].sort((a, b) => a.actualBalance - b.actualBalance)

  if (sortedCategories.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedCategories.map((cat) => (
        <Card key={cat.category.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ColorBadge color={cat.category.color} />
                <CardTitle className="text-base">{cat.category.name}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span
                  className={cn(
                    'font-medium',
                    cat.actualBalance >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {formatMoney(cat.actualBalance)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Forecast</span>
                <span
                  className={cn(
                    cat.forecastBalance >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {formatMoney(cat.forecastBalance)}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fixed: {formatMoney(cat.fixedBalance)}</span>
                <span>One-time: {formatMoney(cat.oneTimeBalance)}</span>
              </div>
            </div>

            {cat.category.goal && (
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Goal progress</span>
                  <span>
                    {cat.progress !== null ? `${Math.abs(cat.progress * 100).toFixed(0)}%` : '-'}
                  </span>
                </div>
                <Progress
                  value={Math.min(Math.abs((cat.progress || 0) * 100), 100)}
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground mt-1 text-right">
                  Goal: {formatMoney(cat.category.goal)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
