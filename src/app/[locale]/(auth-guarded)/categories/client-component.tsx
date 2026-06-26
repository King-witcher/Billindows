'use client'

import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useNow } from '@/contexts/now/now-context'
import { useUser } from '@/contexts/user-context'
import { useTransactions } from '@/hooks/use-transaction/use-transactions'
import type { CategoryRow } from '@/lib/database/types'
import { listCategoriesAction } from './actions/list-categories'
import { CategoryCard, type CategoryMonth } from './category-card'
import { CategoryDetailPanel } from './category-detail-panel'
import { CategoryDialog } from './dialogs/category-dialog'
import { DeleteCategoryDialog } from './dialogs/delete-category-dialog'

interface Props {
  initialCategories: CategoryRow[]
}

export function ClientComponent({ initialCategories }: Props) {
  const t = useTranslations('categories')
  const user = useUser()
  const now = useNow()

  const [selected, setSelected] = useState<CategoryRow | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryRow | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRow | null>(null)
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false)

  const categoriesQuery = useQuery({
    queryKey: ['categories', user.email],
    queryFn: async () => listCategoriesAction(),
    staleTime: Infinity,
    initialData: initialCategories,
  })

  const transactionsQuery = useTransactions(now.year, now.month)

  // Aggregate the current month's transactions per category (balance, count, list).
  const byCategory = useMemo(() => {
    const map = new Map<string, CategoryMonth>()
    for (const tx of transactionsQuery.data ?? []) {
      const entry = map.get(tx.category_id) ?? { balance: 0, count: 0, transactions: [] }
      entry.balance += tx.amount
      entry.count += 1
      entry.transactions.push(tx)
      map.set(tx.category_id, entry)
    }
    for (const entry of map.values()) {
      entry.transactions.sort((a, b) => b.date.day - a.date.day)
    }
    return map
  }, [transactionsQuery.data])

  function handleCreate() {
    setCategoryToEdit(null)
    setCategoryDialogOpen(true)
  }

  function handleEdit(category: CategoryRow) {
    setSelected(null)
    setCategoryToEdit(category)
    setCategoryDialogOpen(true)
  }

  function handleDelete(category: CategoryRow) {
    setSelected(null)
    setCategoryToDelete(category)
    setDeleteCategoryOpen(true)
  }

  const categories = categoriesQuery.data

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus /> {t('add')}
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-1 px-6 py-14 text-center">
            <p className="text-sm font-medium">{t('empty')}</p>
            <p className="max-w-xs text-sm text-muted-foreground">{t('emptyHint')}</p>
            <Button onClick={handleCreate} variant="outline" size="sm" className="mt-3">
              <Plus /> {t('add')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              month={byCategory.get(category.id)}
              loading={transactionsQuery.isLoading}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      <CategoryDetailPanel
        category={selected}
        month={selected ? byCategory.get(selected.id) : undefined}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DeleteCategoryDialog
        open={deleteCategoryOpen}
        onOpenChange={setDeleteCategoryOpen}
        category={categoryToDelete}
      />
      <CategoryDialog
        isOpen={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        categoryToEdit={categoryToEdit}
      />
    </div>
  )
}
