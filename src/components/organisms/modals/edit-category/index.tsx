'use client'

import { Button, Modal, Paper, Typography } from '@mui/material'

interface Props {
  open: boolean
  onClose: () => void
}

export function EditCategoryModal({ open, onClose }: Props) {
  return (
    <Modal aria-label="create-category-modal" open={open} onClose={onClose}>
      <Paper
        elevation={10}
        className="absolute top-1/2 left-1/2 w-[450px] translate-x-[-50%] translate-y-[-50%] p-[20px] max-w-[calc(100%_-_40px)]"
      >
        <div className="flex flex-col gap-[20px] items-start">
          <Typography variant="h5" color="primary">
            Edit category
          </Typography>
          <Typography variant="body1">
            Editing categories is not available yet.
          </Typography>
          <div className="flex self-end gap-[20px]">
            <Button variant="contained" onClick={onClose}>
              Ok
            </Button>
          </div>
        </div>
      </Paper>
    </Modal>
  )
}
