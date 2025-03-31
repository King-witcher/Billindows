'use client'

import { Button, Paper, Typography } from '@mui/material'

interface Props {
  onClose: () => void
}

export function EditTransactionDialog({ onClose }: Props) {
  return (
    <Paper
      elevation={10}
      className="absolute top-1/2 left-1/2 w-[450px] translate-x-[-50%] translate-y-[-50%] p-[20px] max-w-[calc(100%_-_40px)]"
    >
      <div className="flex flex-col gap-[20px] items-start">
        <Typography variant="h5" color="primary">
          Edit transaction
        </Typography>
        <Typography variant="body1">
          Editing transactions is not available yet.
        </Typography>
        <div className="flex self-end gap-[20px]">
          <Button variant="contained" onClick={onClose}>
            Ok
          </Button>
        </div>
      </div>
    </Paper>
  )
}
