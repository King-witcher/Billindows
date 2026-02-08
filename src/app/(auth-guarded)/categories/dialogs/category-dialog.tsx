'use client'

import type { Category } from '@prisma/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUser } from '@/contexts/user-context'
import { createCategoryAction } from '../actions/create-category'
import { updateCategoryAction } from '../actions/update-category'
import { CategoryForm, type CategoryFormData } from './category-form'

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  categoryToEdit: Category | null
}

export function CategoryDialog({ onOpenChange, categoryToEdit, isOpen }: Props) {
  const formId = useId()
  const user = useUser()
  const client = useQueryClient()

  const createCategoryMutation = useMutation({
    mutationKey: ['create-category'],
    mutationFn: createCategoryAction,
    onSuccess: () => {
      toast.success('Category created successfully')
      client.refetchQueries({ queryKey: ['categories', user.email] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        `Failed to create category: ${error instanceof Error ? error.message : String(error)}`,
      )
    },
  })

  const updateCategoryMutation = useMutation({
    mutationKey: ['update-category', categoryToEdit?.id],
    mutationFn: async (data: Parameters<typeof updateCategoryAction>[0]) => {
      await updateCategoryAction(data)
      return data
    },
    onSuccess: (data) => {
      toast.success(`Category ${data.updateData.name} updated successfully`)
      client.refetchQueries({ queryKey: ['categories', user.email] })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(
        `Failed to update category: ${error instanceof Error ? error.message : String(error)}`,
      )
    },
  })

  function handleSubmit(data: CategoryFormData) {
    if (categoryToEdit) {
      updateCategoryMutation.mutate({
        id: categoryToEdit.id,
        updateData: {
          name: data.name,
          color: data.color,
          goal: data.goal,
        },
      })
    } else {
      createCategoryMutation.mutate({
        color: data.color,
        name: data.name,
        goal: data.goal,
      })
    }
  }

  const pending = createCategoryMutation.isPending || updateCategoryMutation.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit ? `Edit ${categoryToEdit.name}` : 'Create category'}
          </DialogTitle>
        </DialogHeader>
        <CategoryForm
          formId={formId}
          initData={categoryToEdit ?? undefined}
          onSubmit={handleSubmit}
        />
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="secondary"
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {categoryToEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
