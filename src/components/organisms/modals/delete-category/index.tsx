import { Button, Modal, Paper, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { deleteCategory } from './action'
import { Category } from '@prisma/client'

interface Props {
  open: boolean
  onClose: () => void
  category: Category | null
}

export function DeleteCategoryModal({ open, onClose, category }: Props) {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async () => deleteCategory(category!.id),
    mutationKey: ['delete-category', category?.id],
    onSuccess: () => {
      onClose()
      router.refresh()
    },
  })

  return (
    <Modal aria-label="create-category-modal" open={open} onClose={onClose}>
      <Paper
        elevation={10}
        className="absolute top-1/2 left-1/2 w-[450px] translate-x-[-50%] translate-y-[-50%] p-[20px]"
      >
        <div className="flex flex-col gap-[20px] items-start">
          <Typography variant="h5" color="primary">
            Delete category
          </Typography>
          <Typography variant="body1">
            Are you sure you want to delete the <b>{category?.name}</b>{' '}
            category?
          </Typography>
          <Typography variant="body1">
            Every transaction related to this category will be deleted as well.
          </Typography>
          <div className="flex self-end gap-[20px]">
            <Button
              variant="text"
              onClick={onClose}
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
    </Modal>
  )
}
