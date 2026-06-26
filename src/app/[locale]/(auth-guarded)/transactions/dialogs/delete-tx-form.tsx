'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { CurrencyText } from '@/components/atoms/currency-text'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useNow } from '@/contexts/now/now-context'
import { useUser } from '@/contexts/user-context'
import type { AbstractTransaction } from '@/lib/database/types'
import { deleteTransactionAction } from '../actions/delete-transaction'

interface Props {
  transaction: AbstractTransaction
  onClose: () => void
}

export function DeleteTxForm({ transaction: transactionToDelete, onClose }: Props) {
  const client = useQueryClient()
  const user = useUser()
  const { month } = useNow()
  const t = useTranslations('transactions.deleteDialog')

  const mutation = useMutation({
    mutationFn: async () =>
      deleteTransactionAction({
        recurrence: transactionToDelete.recurrence,
        id: transactionToDelete.id,
      }),
    mutationKey: ['delete-transaction', transactionToDelete.id],
    onMutate() {
      client.setQueryData(['transactions', user.email, month], (oldData: AbstractTransaction[]) => {
        return oldData?.filter((current) => current.id !== transactionToDelete.id)
      })
      onClose()
    },
    onSuccess: () => toast.success(t('deleted')),
    onError() {
      toast.error(t('error'))
      client.refetchQueries({ queryKey: ['transactions', user.email, month] })
    },
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription>{t('body', { name: transactionToDelete.name })}</DialogDescription>
      </DialogHeader>
      <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
        <span className="truncate text-sm font-medium">{transactionToDelete.name}</span>
        <CurrencyText value={transactionToDelete.amount} className="text-sm font-semibold" />
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button variant="destructive" onClick={() => mutation.mutate()}>
          {t('confirm')}
        </Button>
      </DialogFooter>
    </>
  )
}
