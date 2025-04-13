'use client'

import { MoneyField } from '@/components/atoms/inputs/money-input'
import {
  Action,
  ActionState,
  ActionStateEnum,
} from '@/lib/action-state-management'
import { TxDto } from '@/utils/queries/get-one-time-txs'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import FormLabel from '@mui/material/FormLabel'
import InputLabel from '@mui/material/InputLabel'
import { MenuProps } from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Category } from '@prisma/client'
import _ from 'lodash'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useState } from 'react'

type Props = {
  now: Date
  tx?: TxDto
  categories: Category[]
  action: Action
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

export function TxDialog({ onClose, now, action, tx, categories }: Props) {
  const router = useRouter()

  const year = now.getFullYear()
  const [fixed, setFixed] = useState(tx ? tx.type === 'fixed' : false)
  const [month, setMonth] = useState(tx ? tx.month : now.getMonth())
  const [day, setDay] = useState(tx ? tx.day : now.getDate())
  const daysInTheMonth = _.range(1, new Date(year, month + 1, 0).getDate() + 1)

  const [actionState, actionDispatch, isPending] = useActionState(
    async (state: ActionState, formData: FormData) => {
      const result = await action(state, formData)
      if (result.state !== ActionStateEnum.Error) {
        onClose()
        router.refresh()
      }
      return result
    },
    ActionState.idle()
  )

  function handleChangeMonth(e: SelectChangeEvent<number>) {
    const newMonth = Number(e.target.value)
    setMonth(newMonth)

    const daysInNewMonth = new Date(year, newMonth + 1, 0).getDate()
    if (daysInNewMonth < day) setDay(daysInNewMonth)
  }

  return (
    <Paper
      elevation={10}
      className="absolute top-1/2 left-1/2 w-[520px] max-w-[calc(100%_-_40px)] translate-x-[-50%] translate-y-[-50%] p-[20px] flex flex-col gap-[20px]"
    >
      <Typography variant="h5" color="primary">
        {tx ? 'Edit transaction' : 'Create transaction'}
        <b>{tx && ` ${tx.name}`}</b>
      </Typography>

      {!categories.length && (
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

      {Boolean(categories.length) && (
        <form
          action={actionDispatch}
          className="flex flex-col gap-[20px] items-start"
        >
          {tx && <input type="hidden" name="id" value={tx.id} />}
          <FormControl required>
            <RadioGroup
              defaultValue={
                tx ? (tx.value > 0 ? 'income' : 'expense') : 'expense'
              }
              name="type"
              row
            >
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
            defaultValue={tx?.name}
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
                defaultValue={tx?.category_id}
              >
                {categories.map((category) => (
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
              defaultValue={tx ? Math.abs(tx.value) : undefined}
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
              {tx?.type === 'fixed' && (
                <input type="hidden" name="fixed" value="on" />
              )}
              <FormControlLabel
                name="fixed"
                label="Fixed transaction"
                control={
                  <Checkbox
                    checked={fixed}
                    disabled={Boolean(tx)}
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
                  control={
                    <Checkbox
                      disabled={fixed}
                      defaultChecked={tx ? tx.forecast : true}
                    />
                  }
                />
              </Tooltip>
            </FormGroup>
          </FormControl>

          <div className="flex gap-[20px] self-end">
            <Button variant="text" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={isPending}>
              {tx ? 'Save' : 'Create'}
            </Button>
          </div>
        </form>
      )}
    </Paper>
  )
}
