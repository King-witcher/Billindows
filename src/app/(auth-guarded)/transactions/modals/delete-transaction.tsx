'use client'

import { TxDto } from '@/utils/queries/get-one-time-txs'
import { Button, Paper, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { deleteTransaction } from '../actions/delete-transaction'

interface Props {
  transaction: TxDto
  onSuccess: () => void
  onCancel: () => void
}

export function DeleteTransactionDialog({
  transaction,
  onSuccess,
  onCancel,
}: Props) {
  const router = useRouter()

  const value = Math.abs(transaction.value / 100).toFixed(2)

  const mutation = useMutation({
    mutationFn: async () => deleteTransaction(transaction.id),
    mutationKey: ['delete-transaction', transaction.id],
    onSuccess: () => {
      onSuccess()
      router.refresh()
    },
  })

  return (
    <Paper
      elevation={10}
      className="absolute top-1/2 left-1/2 w-[450px] translate-x-[-50%] translate-y-[-50%] p-[20px] max-w-[calc(100%_-_40px)]"
    >
      <div className="flex flex-col gap-[20px] items-start">
        <Typography variant="h5" color="primary">
          Delete transaction
        </Typography>
        <Typography variant="body1">
          You are about to delete the transaction <b>{transaction.name}</b> of{' '}
          <Typography
            fontWeight={600}
            component="b"
            color={transaction.value < 0 ? 'error' : 'success'}
          >
            R$ {value}
          </Typography>
          .
        </Typography>
        <div className="flex self-end gap-[20px]">
          <Button
            variant="text"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
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
    </Paper>
  )
}
