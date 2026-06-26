'use client'

import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUser } from '@/contexts/user-context'
import type { CategoryRow } from '@/lib/database/types'
import { listCategoriesAction } from './actions/list-categories'
import { CategoryItem } from './category-row'
import { CategoryDialog } from './dialogs/category-dialog'
import { DeleteCategoryDialog } from './dialogs/delete-category-dialog'

interface Props {
  initialCategories: CategoryRow[]
}

export function ClientComponent({ initialCategories }: Props) {
  const t = useTranslations('categories')
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryRow | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRow | null>(null)
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false)

  const user = useUser()

  const categoriesQuery = useQuery({
    queryKey: ['categories', user.email],
    queryFn: async () => listCategoriesAction(),
    staleTime: Infinity,
    initialData: initialCategories,
  })

  function handleEdit(category: CategoryRow) {
    setCategoryToEdit(category)
    setCategoryDialogOpen(true)
  }

  function handleDelete(category: CategoryRow) {
    setCategoryToDelete(category)
    setDeleteCategoryOpen(true)
  }

  function handleCreate() {
    setCategoryToEdit(null)
    setCategoryDialogOpen(true)
  }

  const categories = categoriesQuery.data

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus /> {t('add')}
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('colCategory')}</TableHead>
              <TableHead className="hidden text-center sm:table-cell">{t('colGoal')}</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>

        {categories.length === 0 && (
          <div className="flex flex-col items-center gap-1 px-6 py-14 text-center">
            <p className="text-sm font-medium">{t('empty')}</p>
            <p className="max-w-xs text-sm text-muted-foreground">{t('emptyHint')}</p>
            <Button onClick={handleCreate} variant="outline" size="sm" className="mt-3">
              <Plus /> {t('add')}
            </Button>
          </div>
        )}
      </Card>

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
