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
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { createTransaction, getCategories } from '../actions'

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
  const [month, setMonth] = useState(now.getMonth())
  const [day, setDay] = useState(now.getDate())
  const daysInTheMonth = _.range(1, new Date(year, month + 1, 0).getDate() + 1)

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

  function handleChangeMonth(e: SelectChangeEvent<number>) {
    const newMonth = Number(e.target.value)
    setMonth(newMonth)

    const daysInNewMonth = new Date(year, newMonth + 1, 0).getDate()
    if (daysInNewMonth < day) setDay(daysInNewMonth)
  }

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
        className="absolute top-1/2 left-1/2 w-[520px] max-w-[calc(100%_-_20px)] translate-x-[-50%] translate-y-[-50%] p-[20px]"
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
          <div className="flex gap-[20px] w-full">
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

          <div className="flex flex-col sm:flex-row gap-[20px] w-full">
            <div className="flex gap-[20px] flex-3">
              <FormControl className="flex-1" required>
                <InputLabel htmlFor="month">Month</InputLabel>
                <Select
                  id="month"
                  label="Month"
                  value={month}
                  onChange={handleChangeMonth}
                >
                  {_.range(0, 12).map((month) => (
                    <MenuItem key={month} value={month}>
                      {months[month]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl className="flex-1" required>
                <InputLabel htmlFor="day">Day</InputLabel>
                <Select
                  id="day"
                  label="Day"
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  MenuProps={menuProps}
                >
                  {daysInTheMonth.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <FormControl className="flex-2" required disabled>
              <InputLabel htmlFor="year">Year</InputLabel>
              <Select id="year" label="Year" value={now.getFullYear()}>
                <MenuItem value={now.getFullYear()}>
                  {now.getFullYear()}
                </MenuItem>
              </Select>
            </FormControl>

            <input
              type="hidden"
              name="date"
              value={new Date(year, month, day).getTime()}
            />
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
