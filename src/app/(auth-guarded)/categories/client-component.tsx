'use client'

// import { Button } from '@/components/atoms/button/button'
import {
  Modal,
  Button,
  Typography,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Table,
  TableBody,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { CreateCategoryModal } from '@/components/organisms/modals/create-category'
import { useState } from 'react'
import css from 'styled-jsx/css'
import { DeleteCategoryModal } from '@/components/organisms/modals/delete-category'
import { EditCategoryModal } from '@/components/organisms/modals/edit-category'
import { CategoryRow } from './category-row'

interface Props {
  results: any[]
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}

export function ClientComponent({ results }: Props) {
  const [createCategoryModalOpen, setCreateCategoryModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null)
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null)

  return (
    <div className="p-[20px]">
      <div className="flex items-center justify-between">
        <Typography variant="h2" color="primary">
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
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="center">Goal</TableCell>
              <TableCell align="right">Actions</TableCell>
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
