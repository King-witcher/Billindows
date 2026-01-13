'use client'

import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import type { Category } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import _ from 'lodash'
import { useRouter } from 'next/navigation'
import { type ChangeEvent, useMemo, useState } from 'react'
import { MoneyField } from '@/components/atoms/inputs/money-input'

interface Props {
  category?: Category
  action: (formData: FormData) => Promise<void>
  onClose: () => void
}

/** Generates vivid colores thanks to my strong mathematical skills 😉 */
function getRandomColor(): string {
  function getIntensity() {
    const C = 2
    const x = Math.random()
    return x ** C / (x ** C + (1 - x) ** C)
  }

  function getHex(): string {
    const intensity = getIntensity()
    return _.clamp(Math.floor(256 * intensity), 0, 255)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${getHex()}${getHex()}${getHex()}`
}

export function CategoryDialog({ onClose, action, category }: Props) {
  const router = useRouter()
  const [goalType, setGoalType] = useState<string>(
    category?.goal ? (category.goal > 0 ? 'income' : 'expense') : 'off',
  )

  const initialColor = useMemo(getRandomColor, [])

  const mutation = useMutation({
    mutationFn: action,
    mutationKey: ['create-category'],
    onSuccess: () => {
      onClose()
      router.refresh()
    },
  })

  function handleChangeGoalType(e: ChangeEvent<HTMLInputElement>) {
    setGoalType(e.target.value)
  }

  return (
    <Paper
      elevation={10}
      className="absolute top-1/2 left-1/2 w-[450px] translate-x-[-50%] translate-y-[-50%] p-[20px] max-w-[calc(100%_-_40px)]"
    >
      <form className="flex flex-col gap-[20px] items-start" action={mutation.mutate}>
        {category && <input type="hidden" name="id" value={category.id} />}
        <Typography variant="h5" color="primary">
          {category ? 'Edit category' : 'Create category'} <b>{category?.name}</b>
        </Typography>
        <TextField
          variant="outlined"
          label="Name"
          name="name"
          defaultValue={category?.name}
          required
          slotProps={{
            htmlInput: {
              maxLength: 30,
            },
          }}
          fullWidth
        />
        <div className="flex w-full gap-[20px]">
          <MoneyField
            className="flex-1"
            disabled={goalType === 'off'}
            required={goalType !== 'off'}
            defaultValue={category?.goal ? Math.abs(category.goal) : 0}
            name="goal"
          />
          <TextField
            className="flex-1"
            label="Color"
            name="color"
            type="color"
            required
            defaultValue={category?.color ?? initialColor}
          />
        </div>
        <FormControl required>
          <FormLabel>Goal type</FormLabel>
          <RadioGroup
            defaultValue="expense"
            name="goalType"
            value={goalType}
            onChange={handleChangeGoalType}
          >
            <div className="flex">
              <FormControlLabel label="Income" value="income" control={<Radio />} />
              <FormControlLabel label="Expense" value="expense" control={<Radio />} />
              <FormControlLabel label="Off" value="off" control={<Radio />} />
            </div>
          </RadioGroup>
        </FormControl>
        <div className="flex gap-[20px] self-end">
          <Button variant="text" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={mutation.isPending}>
            {category ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Paper>
  )
}
