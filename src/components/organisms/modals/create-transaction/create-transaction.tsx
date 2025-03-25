'use client'

import { MoneyField } from '@/components/atoms/inputs/money-input'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  MenuProps,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { createTransaction, getCategories } from './actions'

interface Props {
  open: boolean
  now: Date
  onClose: () => void
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const menuProps: Partial<MenuProps> = {
  PaperProps: {
    sx: {
      maxHeight: '300px',
    },
  },
}

export function CreateTransactionModal({ open, onClose, now }: Props) {
  const router = useRouter()

  const year = now.getFullYear()
  const month = now.getMonth()
  const monthName = months[month]
  const daysOnTheMonth = _.range(1, new Date(year, month + 1, 0).getDate() + 1)

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

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

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

          <div className="flex gap-[10px] w-full">
            <FormControl className="flex-3" required disabled>
              <input type="hidden" name="year" value={year} />
              <InputLabel htmlFor="year">Year</InputLabel>
              <Select
                id="year"
                name="year"
                label="Year"
                value={now.getFullYear()}
              >
                <MenuItem value={now.getFullYear()}>
                  {now.getFullYear()}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl className="flex-3" required disabled>
              <input type="hidden" name="month" value={month} />
              <InputLabel htmlFor="month">Month</InputLabel>
              <Select id="month" name="month" label="Month" value={month}>
                <MenuItem value={month}>{monthName}</MenuItem>
              </Select>
            </FormControl>

            <FormControl className="flex-2" required>
              <InputLabel htmlFor="day">Day</InputLabel>
              <Select
                id="day"
                name="day"
                label="Day"
                defaultValue={now.getDate()}
                MenuProps={menuProps}
              >
                {daysOnTheMonth.map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

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
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={mutation.isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </Paper>
    </Modal>
  )
}
