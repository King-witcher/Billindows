'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
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
import type { CategoryRow } from '@/lib/database/types'
import { createCategoryAction } from '../actions/create-category'
import { updateCategoryAction } from '../actions/update-category'
import { CategoryForm, type CategoryFormData } from './category-form'

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  categoryToEdit: CategoryRow | null
}

export function CategoryDialog({ onOpenChange, categoryToEdit, isOpen }: Props) {
  const formId = useId()
  const user = useUser()
  const client = useQueryClient()
  const t = useTranslations('categories.dialog')

  const createCategoryMutation = useMutation({
    mutationKey: ['create-category'],
    mutationFn: createCategoryAction,
    onSuccess: () => {
      toast.success(t('created'))
      client.refetchQueries({ queryKey: ['categories', user.email] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('createError'))
    },
  })

  const updateCategoryMutation = useMutation({
    mutationKey: ['update-category', categoryToEdit?.id],
    mutationFn: async (data: Parameters<typeof updateCategoryAction>[0]) => {
      await updateCategoryAction(data)
      return data
    },
    onSuccess: (data) => {
      toast.success(t('updated', { name: data.updateData.name }))
      client.refetchQueries({ queryKey: ['categories', user.email] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('updateError'))
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
            {categoryToEdit ? t('editTitle', { name: categoryToEdit.name }) : t('createTitle')}
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
            {t('cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {categoryToEdit ? t('save') : t('create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
