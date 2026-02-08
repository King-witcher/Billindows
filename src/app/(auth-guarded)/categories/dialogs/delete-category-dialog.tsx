'use client'

import type { Category } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUser } from '@/contexts/user-context'
import { deleteCategoryAction } from '../actions/delete-category'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
}

export function DeleteCategoryDialog({ category, open, onOpenChange }: Props) {
  const client = useQueryClient()
  const user = useUser()

  const mutation = useMutation({
    mutationKey: ['delete-category', category?.id],
    mutationFn: async () => deleteCategoryAction({ id: category?.id ?? -1 }),
    onMutate: () => {
      client.setQueryData<Category[]>(['categories', user.email], (oldData) => {
        if (!oldData) return oldData
        return oldData.filter((c) => c.id !== category?.id)
      })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        `Failed to delete category: ${error instanceof Error ? error.message : String(error)}`,
      )
      client.refetchQueries({ queryKey: ['categories', user.email] })
    },
    onSuccess: () => {
      toast.success(`Deleted category ${category?.name} successfully`)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Delete category</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the <b>{category?.name}</b> category? Every transaction
          related to this category will be deleted as well.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
