'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
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

  const value = Math.abs(transactionToDelete.amount / 100).toFixed(2)

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
    onSuccess: () => toast.success('Transaction deleted successfully'),
    onError() {
      toast.error('Error deleting transaction')
      client.refetchQueries({ queryKey: ['transactions', user.email, month] })
    },
  })

  return (
    <div className="flex flex-col gap-[20px] items-start">
      <DialogTitle className="text-primary">Delete transaction</DialogTitle>
      <DialogDescription>
        You are about to delete the transaction <b>{transactionToDelete.name}</b> of{' '}
        <span
          className={clsx(
            'font-semibold',
            transactionToDelete.amount < 0 ? 'text-red-600' : 'text-green-600',
          )}
        >
          R$ {value}
        </span>
        .
      </DialogDescription>
      <div className="flex self-end gap-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="destructive" onClick={() => mutation.mutate()}>
          Delete
        </Button>
      </div>
    </div>
  )
}
