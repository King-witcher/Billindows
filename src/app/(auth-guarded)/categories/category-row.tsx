'use client'

import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import { IconButton, TableCell, TableRow, Tooltip } from '@mui/material'
import { Category } from '@prisma/client'

interface Props {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

export function CategoryRow({ category, onDelete, onEdit }: Props) {
  return (
    <TableRow hover>
      <TableCell>
        <div className="flex items-center min-w-0 gap-[10px] max-w-[200px] sm:max-w-[300px]">
          <style jsx>{`
          .color-badge {
            width: 14px;
            height: 14px;
            border-radius: 999px;
            flex-shrink: 0;
            background: ${category.color};
          }
        `}</style>
          <div className="color-badge" />
          <Tooltip title={category.name}>
            <span className="truncate">{category.name}</span>
          </Tooltip>
        </div>
      </TableCell>
      <TableCell align="center" className="!hidden sm:!table-cell">
        {category.goal !== null
          ? `R$ ${(category.goal / 100).toFixed(2)}`
          : '-'}
      </TableCell>
      <TableCell align="right" className="whitespace-nowrap">
        <Tooltip title="Edit">
          <IconButton onClick={() => onEdit(category)}>
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton onClick={() => onDelete(category)}>
            <Delete />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
