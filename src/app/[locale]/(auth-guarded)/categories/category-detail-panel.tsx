'use client'

import { Pencil, Repeat, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { CategoryRow } from '@/lib/database/types'
import type { CategoryMonth } from './category-card'

type Props = {
  category: CategoryRow | null
  month: CategoryMonth | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (category: CategoryRow) => void
  onDelete: (category: CategoryRow) => void
}

export function CategoryDetailPanel({
  category,
  month,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: Props) {
  const t = useTranslations('categories')
  const locale = useLocale()

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' }),
    [locale],
  )

  const balance = month?.balance ?? 0
  const count = month?.count ?? 0
  const transactions = month?.transactions ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="gap-1 pr-10">
          <SheetTitle className="flex items-center gap-2">
            {category && (
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            )}
            <span className="truncate">{category?.name}</span>
          </SheetTitle>
          <SheetDescription>{t('detailSubtitle')}</SheetDescription>
        </SheetHeader>

        {/* Month summary */}
        <div className="flex items-end justify-between gap-4 px-4">
          <div>
            <p className="text-xs text-muted-foreground">{t('balanceInMonth')}</p>
            <div className="mt-0.5 text-2xl font-semibold">
              <CurrencyText value={balance} />
            </div>
          </div>
          <p className="pb-1 text-sm text-muted-foreground">{t('txCount', { count })}</p>
        </div>

        <Separator className="my-4" />

        {/* Transactions of the month */}
        <div className="flex-1 overflow-y-auto px-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('monthTransactions')}
          </p>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t('noTransactions')}</p>
          ) : (
            <ul className="flex flex-col">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0"
                >
                  <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">
                    {dateFormat.format(new Date(tx.date.year, tx.date.month - 1, tx.date.day))}
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="truncate text-sm">{tx.name}</span>
                    {tx.recurrence === 'fixed' && (
                      <Repeat className="size-3 shrink-0 text-muted-foreground" />
                    )}
                  </span>
                  <CurrencyText value={tx.amount} className="shrink-0 text-sm" />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t p-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => category && onEdit(category)}
            disabled={!category}
          >
            <Pencil /> {t('edit')}
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => category && onDelete(category)}
            disabled={!category}
          >
            <Trash2 /> {t('delete')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
