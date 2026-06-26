'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
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
import type { CategoryRow } from '@/lib/database/types'
import { deleteCategoryAction } from '../actions/delete-category'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryRow | null
}

export function DeleteCategoryDialog({ category, open, onOpenChange }: Props) {
  const client = useQueryClient()
  const user = useUser()
  const t = useTranslations('categories.deleteDialog')

  const mutation = useMutation({
    mutationKey: ['delete-category', category?.id],
    mutationFn: async () => deleteCategoryAction({ id: category?.id ?? '' }),
    onMutate: () => {
      client.setQueryData<CategoryRow[]>(['categories', user.email], (oldData) => {
        if (!oldData) return oldData
        return oldData.filter((c) => c.id !== category?.id)
      })
      onOpenChange(false)
    },
    onError: () => {
      toast.error(t('error'))
      client.refetchQueries({ queryKey: ['categories', user.email] })
    },
    onSuccess: () => {
      toast.success(t('deleted', { name: category?.name ?? '' }))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription>{t('body', { name: category?.name ?? '' })}</DialogDescription>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
