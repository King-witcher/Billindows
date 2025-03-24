'use client'

import { Delete, Edit } from '@mui/icons-material'
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material'
import { Category } from '@prisma/client'

interface Props {
  category: Category
  setCategoryToEdit: (category: Category) => void
  setCategoryToDelete: (category: Category) => void
}

export function CategoryRow({
  category,
  setCategoryToDelete,
  setCategoryToEdit,
}: Props) {
  return (
    <TableRow hover>
      <TableCell>
        <div className="flex items-center gap-[10px]">
          <style jsx>{`
          .color-badge {
            width: 14px;
            height: 14px;
            border-radius: 999px;
            background: ${category.color};
          }
        `}</style>
          <div className="color-badge" />
          {category.name}
        </div>
      </TableCell>
      <TableCell align="center">
        {category.goal !== null
          ? `R$ ${(category.goal / 100).toFixed(2)}`
          : '-'}
      </TableCell>
      <TableCell align="right">
        <Tooltip title="Edit">
          <IconButton onClick={() => setCategoryToEdit(category)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={() => setCategoryToDelete(category)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
