'use client'

import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useState } from 'react'
import { createTransaction, getCategories } from './actions'
import { MoneyField } from '@/components/atoms/inputs/money-input'

interface Props {
  open: boolean
  onClose: () => void
}

export function CreateTransactionModal({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: createTransaction,
    mutationKey: ['create-category'],
    onSuccess: () => {
      handleClose()
      router.refresh()
    },
  })

  const categoriesQuery = useQuery({
    queryKey: ['get-categories'],
    enabled: open,
    queryFn: getCategories,
  })

  function handleClose() {
    setName('')
    onClose()
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
  }

  return (
    <Modal
      aria-label="create-transaction-modal"
      open={open}
      onClose={handleClose}
    >
      <Paper
        elevation={10}
        className="absolute top-1/2 left-1/2 w-[520px] translate-x-[-50%] translate-y-[-50%] p-[20px]"
      >
        <form
          action={mutation.mutate}
          className="flex flex-col gap-[20px] items-start"
        >
          <Typography variant="h5" color="primary">
            Create transaction
          </Typography>
          <FormControl required>
            <RadioGroup defaultValue="expense" name="type" row>
              <FormControlLabel
                label="Income"
                value="income"
                control={<Radio />}
              />
              <FormControlLabel
                label="Expense"
                value="expense"
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>
          <TextField
            value={name}
            onChange={handleChange}
            variant="outlined"
            label="Name"
            name="name"
            required
            fullWidth
          />
          <div className="flex gap-[10px] w-full">
            <FormControl className="flex-1" required>
              <InputLabel htmlFor="category">Category</InputLabel>
              <Select
                id="category"
                name="category"
                label="Category"
                labelId="ola"
                defaultValue=""
                disabled={categoriesQuery.isLoading}
              >
                {categoriesQuery.data?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <MoneyField
              className="flex-1"
              variant="outlined"
              label="Value"
              name="value"
              required
              fullWidth
            />
          </div>

          {/* <Switch color="error" /> */}

          <FormControl>
            <FormLabel>Behavior</FormLabel>
            <FormGroup>
              <FormControlLabel
                disabled
                checked
                label="Forecast"
                control={<Checkbox />}
              />
              <FormControlLabel disabled label="Fixed" control={<Checkbox />} />
            </FormGroup>
          </FormControl>

          <div className="flex gap-[20px] self-end">
            <Button
              variant="text"
              onClick={onClose}
              // disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              // onClick={() => mutation.mutate()}
              // disabled={mutation.isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </Paper>
    </Modal>
  )
}
