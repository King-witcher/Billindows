'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUser } from '@/contexts/user-context'
import type { AbstractTransaction } from '@/lib/database/types'
import { endRecurrenceAction } from '../actions/end-recurrence'

interface Props {
  transaction: AbstractTransaction
  onClose: () => void
}

export function EndRecurrenceForm({ transaction, onClose }: Props) {
  const client = useQueryClient()
  const user = useUser()
  const t = useTranslations('transactions.endDialog')

  const mutation = useMutation({
    mutationFn: async () => endRecurrenceAction({ id: transaction.id }),
    mutationKey: ['end-recurrence', transaction.id],
    onSuccess: () => {
      toast.success(t('done'))
      client.refetchQueries({ queryKey: ['transactions', user.email] })
      onClose()
    },
    onError: () => toast.error(t('error')),
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription>{t('body', { name: transaction.name })}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
          {t('cancel')}
        </Button>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {t('confirm')}
        </Button>
      </DialogFooter>
    </>
  )
}
