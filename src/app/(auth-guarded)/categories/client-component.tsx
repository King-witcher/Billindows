'use client'

import { Add } from '@mui/icons-material'
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { Category } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { listCategoriesAction } from './actions/list-categories'
import { CategoryRow } from './category-row'
import { CategoryDialog } from './dialogs/category-dialog'
import { DeleteCategoryDialog } from './dialogs/delete-category-dialog'

interface Props {
  initialCategories: Category[]
}

export function ClientComponent({ initialCategories }: Props) {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false)

  const user = useUser()

  const categoriesQuery = useQuery({
    queryKey: ['categories', user.email],
    queryFn: async () => listCategoriesAction(),
    staleTime: Infinity,
    initialData: initialCategories,
  })

  function handleEdit(category: Category) {
    setCategoryToEdit(category)
    setCategoryDialogOpen(true)
  }

  function handleDelete(category: Category) {
    setCategoryToDelete(category)
    setDeleteCategoryOpen(true)
  }

  function handleCreate() {
    setCategoryToEdit(null)
    setCategoryDialogOpen(true)
  }

  return (
    <div className="p-[20px] flex flex-col gap-[20px] h-full">
      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-[20px] w-full ml-auto">
        <Typography className="self-start" variant="h3" color="primary">
          Categories
        </Typography>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleCreate}>
          Add category
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="center" className="!hidden sm:!table-cell">
                Goal
              </TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {categoriesQuery.data.map((category) => (
              <CategoryRow
                onDelete={handleDelete}
                onEdit={handleEdit}
                key={category.id}
                category={category}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
