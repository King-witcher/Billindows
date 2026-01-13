'use client'

import { Add } from '@mui/icons-material'
// import { Button } from '@/components/atoms/button/button'
import {
  Button,
  Modal,
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
import { useState } from 'react'
import { createCategory } from './actions/create-category'
import { editCategory } from './actions/edit-category'
import { CategoryRow } from './category-row'
import { CategoryDialog } from './modals/category-dialog'
import { DeleteCategoryDialog } from './modals/delete-category'

interface Props {
  categories: Category[]
}

export function ClientComponent({ categories: results }: Props) {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>()
  const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>()

  const categoryAction = categoryToEdit ? editCategory : createCategory

  function handleClose() {
    setCategoryDialogOpen(false)
    setCategoryToEdit(undefined)
    setCategoryToDelete(undefined)
  }

  function handleEdit(category: Category) {
    setCategoryToEdit(category)
    setCategoryDialogOpen(true)
  }

  return (
    <div className="p-[20px] flex flex-col gap-[20px] h-full">
      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-[20px] w-full ml-auto">
        <Typography className="self-start" variant="h3" color="primary">
          Categories
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setCategoryDialogOpen(true)}
        >
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
            {results.map((category) => (
              <CategoryRow
                onDelete={setCategoryToDelete}
                onEdit={handleEdit}
                key={category.id}
                category={category}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal onClose={handleClose} open={categoryDialogOpen}>
        <CategoryDialog action={categoryAction} onClose={handleClose} category={categoryToEdit} />
      </Modal>
      <Modal open={!!categoryToDelete} onClose={handleClose}>
        <DeleteCategoryDialog onClose={handleClose} category={categoryToDelete} />
      </Modal>
    </div>
  )
}
