'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { CategoryRow } from '@/lib/database/types'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/utils/utils'
import { forecast, type TarnsactionsSummary } from '../helpers'

type CategoryTableProps = {
  categorySummaries: Record<string, TarnsactionsSummary>
  categoriesMap: Map<string, CategoryRow>
  monthProgress: number
  loading: boolean
}

function ColorBadge({ color }: { color: string }) {
  return <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
}

export function CategoryTable({
  categorySummaries,
  categoriesMap,
  monthProgress,
  loading,
}: CategoryTableProps) {
  const sortedCategories = useMemo(() => {
    return Object.entries(categorySummaries).sort(([, a], [, b]) => {
      const aBalance = a.totalIncome - a.totalExpenses
      const bBalance = b.totalIncome - b.totalExpenses
      return Math.abs(bBalance) - Math.abs(aBalance)
    })
  }, [categorySummaries])

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
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Balance</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">Forecast</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground min-w-30 w-60 hidden md:table-cell">
                  Goal progress
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map(([categoryId, summary]) => {
                const category = categoriesMap.get(categoryId)
                const balance = summary.totalIncome - summary.totalExpenses
                const goalPercentage = category?.goal
                  ? Math.max((100 * balance) / category.goal, 0)
                  : 0
                const forecastedBalance = (() => {
                  const unforecasted = balance - summary.forecastable
                  return unforecasted + forecast(summary.forecastable, monthProgress)
                })()
                if (!category) throw new Error(`Category not found for ID ${categoryId}`)

                return (
                  <tr
                    key={categoryId}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <ColorBadge color={category.color} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        'text-right py-3 px-2 font-semibold',
                        balance < 0 ? 'text-red-600' : 'text-emerald-600',
                      )}
                    >
                      {formatMoney(Math.abs(balance))}
                    </td>
                    <td
                      className={cn(
                        'text-right py-3 px-2 font-semibold',
                        forecastedBalance < 0 ? 'text-red-600' : 'text-emerald-600',
                      )}
                    >
                      {formatMoney(Math.abs(forecastedBalance))}
                    </td>

                    <td className="py-3 px-2 hidden md:table-cell">
                      {category.goal ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              {goalPercentage.toFixed(0)}%
                            </span>
                            <span
                              className={cn(
                                'text-muted-foreground font-bold',
                                category.goal >= 0 ? 'text-emerald-600' : 'text-red-600',
                              )}
                            >
                              {formatMoney(Math.abs(category.goal))}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(goalPercentage, 100)}
                            variant={category.goal < 0 && goalPercentage > 95 ? 'red' : 'default'}
                            className="h-1.5"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No goal</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
