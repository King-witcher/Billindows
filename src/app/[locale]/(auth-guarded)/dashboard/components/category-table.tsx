'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { CategoryRow } from '@/lib/database/types'
import { forecast, type TarnsactionsSummary } from '../helpers'

type CategoryTableProps = {
  categorySummaries: Record<string, TarnsactionsSummary>
  categoriesMap: Map<string, CategoryRow>
  monthProgress: number
  loading: boolean
}

export function CategoryTable({
  categorySummaries,
  categoriesMap,
  monthProgress,
  loading,
}: CategoryTableProps) {
  const t = useTranslations('dashboard')

  const sortedCategories = useMemo(() => {
    return Object.entries(categorySummaries).sort(([, a], [, b]) => {
      const aBalance = a.totalIncome - a.totalExpenses
      const bBalance = b.totalIncome - b.totalExpenses
      return Math.abs(bBalance) - Math.abs(aBalance)
    })
  }, [categorySummaries])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('categoryAnalysis')}</CardTitle>
        <CardDescription>{t('categoryAnalysisDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {sortedCategories.length === 0 ? (
          <p className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            {loading ? '' : t('noTxForFilter')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">{t('colCategory')}</TableHead>
                <TableHead className="text-right">{t('colBalance')}</TableHead>
                <TableHead className="pr-6 text-right">{t('colForecast')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCategories.map(([categoryId, summary]) => {
                const category = categoriesMap.get(categoryId)
                if (!category) throw new Error(`Category not found for ID ${categoryId}`)

                const balance = summary.totalIncome - summary.totalExpenses
                const unforecasted = balance - summary.forecastable
                const forecastedBalance =
                  unforecasted + forecast(summary.forecastable, monthProgress)

                return (
                  <TableRow key={categoryId}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyText value={balance} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <CurrencyText value={forecastedBalance} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
