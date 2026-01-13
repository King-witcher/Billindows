'use client'

import { Button, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { TxDto } from '@/utils/queries/get-one-time-txs'
import { deleteTransactionAction } from '../actions/delete-transaction'

interface Props {
  tx: TxDto
  onClose: () => void
}

export function DeleteTxDialog({ tx, onClose }: Props) {
  const client = useQueryClient()

  const value = Math.abs(tx.value / 100).toFixed(2)

  const mutation = useMutation({
    mutationFn: async () => {
      await deleteTransactionAction(tx.type, tx.id)
    },
    mutationKey: ['delete-transaction', tx.id],
    onMutate() {
      onClose()
      client.setQueryData(['transactions'], (oldData: TxDto[]) => {
        return oldData?.filter((current) => current.id !== tx.id)
      })
    },
    onSuccess() {
      toast.success('Transaction deleted successfully')
    },
    onError() {
      toast.error('Error deleting transaction')
      client.refetchQueries({ queryKey: ['transactions'] })
    },
  })

  return (
    <div className="flex flex-col gap-[20px] items-start">
      <Typography variant="h5" color="primary">
        Delete transaction
      </Typography>
      <Typography variant="body1">
        You are about to delete the transaction <b>{tx.name}</b> of{' '}
        <Typography fontWeight={600} component="b" color={tx.value < 0 ? 'error' : 'success'}>
          R$ {value}
        </Typography>
        .
      </Typography>
      <div className="flex self-end gap-[20px]">
        <Button variant="text" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
