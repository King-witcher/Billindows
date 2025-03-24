'use client'

import { Button, Modal, Paper, TextField, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'
import { createCategory } from './action'

interface Props {
  open: boolean
  onClose: () => void
}

export function CreateCategoryModal({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async () => createCategory(name),
    mutationKey: ['create-category', name],
    onSuccess: () => {
      handleClose()
      router.refresh()
    },
  })

  function handleClose() {
    setName('')
    onClose()
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
  }

  return (
    <Modal aria-label="create-category-modal" open={open} onClose={handleClose}>
      <Paper
        elevation={10}
        className="absolute top-1/2 left-1/2 w-[450px] translate-x-[-50%] translate-y-[-50%] p-[20px]"
      >
        <div className="flex flex-col gap-[20px] items-start">
          <Typography variant="h5" color="primary">
            Create category
          </Typography>
          <TextField
            value={name}
            onChange={handleChange}
            variant="outlined"
            label="Name"
            fullWidth
          />
          <div className="flex gap-[20px] self-end">
            <Button
              variant="text"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Paper>
    </Modal>
  )
}
