'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { Transaction } from '@/database/repositories/transactions'
import type { WithId } from '@/types/with-id'
import { deleteTransactionAction } from '../actions/delete-transaction'

interface Props {
  tx: WithId<Transaction>
  onClose: () => void
}

export function DeleteTxForm({ tx, onClose }: Props) {
  const client = useQueryClient()

  const value = Math.abs(tx.value / 100).toFixed(2)

  const mutation = useMutation({
    mutationFn: async () => deleteTransactionAction(tx.type, tx.id),
    mutationKey: ['delete-transaction', tx.id],
    onMutate() {
      onClose()
      client.setQueryData(['transactions'], (oldData: WithId<Transaction>[]) => {
        return oldData?.filter((current) => current.id !== tx.id)
      })
    },
    onSuccess: () => toast.success('Transaction deleted successfully'),
    onError() {
      toast.error('Error deleting transaction')
      client.refetchQueries({ queryKey: ['transactions'] })
    },
  })

  return (
    <div className="flex flex-col gap-[20px] items-start">
      <DialogTitle className="text-primary">Delete transaction</DialogTitle>
      <DialogDescription>
        You are about to delete the transaction <b>{tx.name}</b> of{' '}
        <span className={clsx('font-semibold', tx.value < 0 ? 'text-red-600' : 'text-green-600')}>
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
