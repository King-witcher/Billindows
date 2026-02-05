import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Transaction } from '@/database/repositories/transactions'
import type { WithId } from '@/types/with-id'
import { createTxAction } from '../actions/create-tx'
import { updateTxAction } from '../actions/udpate-tx'
import { TxForm } from './tx-form'

type Props = {
  txToEdit?: WithId<Transaction>
  open: boolean
  onOpenChange?: (open: boolean) => void
}

export function TxDialog(props: Props) {
  const { txToEdit, open, onOpenChange } = props
  const client = useQueryClient()

  const updateMutation = useMutation({
    mutationKey: ['update-transaction', txToEdit?.id],
    mutationFn: updateTxAction,
    onSuccess: () => {
      client.refetchQueries({ queryKey: ['transactions'] })
      toast.success('Transaction updated successfully')
      onOpenChange?.(false)
    },
    onError: () => toast.error('Error updating transaction'),
  })

  const createMutation = useMutation({
    mutationKey: ['create-transaction'],
    mutationFn: createTxAction,
    onSuccess: () => {
      toast.success('Transaction created successfully')
      client.refetchQueries({ queryKey: ['transactions'] })
      onOpenChange?.(false)
    },
    onError: () => toast.error('Error creating transaction'),
  })

  async function handleSubmit(data: Transaction) {
    if (txToEdit) {
      await updateMutation.mutateAsync({ id: txToEdit.id, transaction: data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-primary">
            {txToEdit ? `Edit ${txToEdit.name}` : 'Create Transaction'}
          </DialogTitle>
        </DialogHeader>
        <TxForm
          isEditting={Boolean(txToEdit)}
          initValue={txToEdit}
          onSubmit={handleSubmit}
          onClose={() => onOpenChange?.(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
