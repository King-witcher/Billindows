'use client'

import { CreateCategoryModal } from '@/components/organisms/modals/create-category'
import { DeleteCategoryModal } from '@/components/organisms/modals/delete-category'
import { EditCategoryModal } from '@/components/organisms/modals/edit-category'
import { Add } from '@mui/icons-material'
// import { Button } from '@/components/atoms/button/button'
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
import { Category } from '@prisma/client'
import { useState } from 'react'
import { CategoryRow } from './category-row'

interface Props {
  categories: Category[]
}

export function ClientComponent({ categories: results }: Props) {
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  )
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)

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
          onClick={() => setCreateCategoryModalOpen(true)}
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
                setCategoryToDelete={setCategoryToDelete}
                setCategoryToEdit={setCategoryToEdit}
                key={category.id}
                category={category}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CreateCategoryModal
        open={createCategoryModalOpen}
        onClose={() => setCreateCategoryModalOpen(false)}
      />
      <DeleteCategoryModal
        open={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        category={categoryToDelete}
      />
      <EditCategoryModal
        open={!!categoryToEdit}
        onClose={() => setCategoryToEdit(null)}
      />
    </div>
  )
}
