'use client'

import { Add } from '@mui/icons-material'
import { Button } from '@mui/material'
import { useState } from 'react'
import { TxDialog } from '../../transactions/modals/tx-dialog'

export function CreateTxButton() {
  const [txModalOpen, setTxModalOpen] = useState(false)

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

      <TxDialog open={txModalOpen} onOpenChange={setTxModalOpen} />
    </>
  )
}
