'use client'

import { MoneyField } from '@/components/atoms/inputs/money-input'
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  MenuProps,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useCallback, useState } from 'react'
import { createTxAction } from '../actions/create-transaction'
import { getCategories } from '../actions/get-categories'
import { ActionState, ActionStateEnum } from '@/lib/action-state-management'

interface Props {
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

export function CreateTransactionModal({ onClose, now }: Props) {
  const router = useRouter()

  const year = now.getFullYear()
  const [fixed, setFixed] = useState(false)
  const [month, setMonth] = useState(now.getMonth())
  const [day, setDay] = useState(now.getDate())
  const daysInTheMonth = _.range(1, new Date(year, month + 1, 0).getDate() + 1)

  const [createTxState, createTx, isPending] = useActionState(
    async (state: ActionState, formData: FormData) => {
      const result = await createTxAction(state, formData)
      if (result.state !== ActionStateEnum.Error) {
        handleClose()
        router.refresh()
      }
      return result
    },
    ActionState.idle()
  )

  const categoriesQuery = useQuery({
    queryKey: ['get-categories'],
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
    <Paper
      elevation={10}
      className="absolute top-1/2 left-1/2 w-[520px] max-w-[calc(100%_-_40px)] translate-x-[-50%] translate-y-[-50%] p-[20px] flex flex-col gap-[20px]"
    >
      <Typography variant="h5" color="primary">
        Create transaction
      </Typography>

      {categoriesQuery.isPending && (
        <div className="w-full h-[200px] flex items-center justify-center">
          <CircularProgress size="60px" />
        </div>
      )}

      {!categoriesQuery.isFetching && !categoriesQuery.data?.length && (
        <>
          <Typography variant="body1">
            You haven&apos;t created a category yet. You must create at least
            one category to create transactions.
          </Typography>
          <div className="flex self-end gap-[20px]">
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/categories"
              onClick={onClose}
            >
              Create categories
            </Button>
          </div>
        </>
      )}

      {!categoriesQuery.isPending && (
        <form
          action={createTx}
          className="flex flex-col gap-[20px] items-start"
        >
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
                  name="month"
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
                  name="day"
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  MenuProps={menuProps}
                >
                  {daysInTheMonth.map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                  ``
                </Select>
              </FormControl>
            </div>

            <FormControl className="flex-2" required>
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
          </div>

          <FormControl>
            <FormLabel>Behavior</FormLabel>
            <FormGroup>
              <FormControlLabel
                name="fixed"
                label="Fixed transaction"
                control={
                  <Checkbox
                    value={fixed}
                    onChange={(e) => {
                      setFixed(e.target.checked)
                    }}
                  />
                }
              />
            </FormGroup>
            <FormGroup>
              <Tooltip title="Whether this transaction should be forecasted or not">
                <FormControlLabel
                  name="forecast"
                  label="Should forecast (new!)"
                  control={<Checkbox disabled={fixed} defaultChecked />}
                />
              </Tooltip>
            </FormGroup>
          </FormControl>

          <div className="flex gap-[20px] self-end">
            <Button variant="text" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={isPending}>
              Create
            </Button>
          </div>
        </form>
      )}
    </Paper>
  )
}
