'use client'

import { Add } from '@mui/icons-material'
import { Button, Modal } from '@mui/material'
import { Category } from '@prisma/client'
import { TxDialog } from '../../transactions/modals/tx-dialog'
import { useState } from 'react'
import { createTxAction } from '../../transactions/actions/create-tx'

interface Props {
  categories: Category[]
  now: Date
}

export function CreateTxButton({ categories, now }: Props) {
  const [txModalOpen, setTxModalOpen] = useState(false)

  function handleClose() {
    setTxModalOpen(false)
  }

  return (
    <>
      <Button
        variant="contained"
        size="large"
        className="self-start"
        startIcon={<Add />}
        onClick={() => setTxModalOpen(true)}
      >
        New transaction
      </Button>
      <Modal open={txModalOpen} onClose={handleClose} className="max-w-full">
        <TxDialog
          now={now}
          categories={categories}
          action={createTxAction}
          onClose={handleClose}
        />
      </Modal>
    </>
  )
}
