'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Asterisk, BanknoteArrowDown, BanknoteArrowUp, Calendar1, CalendarIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as zod from 'zod'
import { MoneyField } from '@/components/atoms/inputs/money-input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Combobox } from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToday } from '@/contexts/today-context'
import { useUser } from '@/contexts/user-context'
import type { Transaction } from '@/database/repositories/transactions'
import { getCategories } from '../actions/get-categories'

const formSchema = zod.object({
  id: zod.number().optional(),
  type: zod.enum(['income', 'expense']),
  name: zod.string().min(1, 'Name is required').max(50, 'Name is too long'),
  categoryId: zod.string().min(1, 'Category is required'),
  value: zod.int().min(1, 'Value must be at least R$ 0,01'),
  date: zod.date(),
  fixed: zod.boolean(),
  ignoreFromForecast: zod.boolean(),
})

export type FormData = zod.infer<typeof formSchema>

type Props = {
  initValue?: Transaction
  isEditting: boolean
  onSubmit: (data: Transaction) => Promise<void>
  onClose: () => void
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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

function formatDate(now: Date, date: Date): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (today.getFullYear() === date.getFullYear()) {
    if (today.getMonth() === date.getMonth()) {
      if (today.getDate() === date.getDate()) return 'Today'
      if (today.getDate() - 1 === date.getDate()) return 'Yesterday'
      return `Day ${date.getDate()} (${weekDays[date.getDay()]})`
    }
    return `${months[date.getMonth()]} ${date.getDate()}`
  }

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function TxForm({ onClose, onSubmit, initValue, isEditting }: Props) {
  const user = useUser()
  const today = useToday()
  const [pending, setPending] = useState(false)

  const categoriesQuery = useQuery({
    queryKey: ['categories', user.email],
    queryFn: getCategories,
    initialData: [],
  })

  const sortedCategories = useMemo(
    () => categoriesQuery.data.sort((a, b) => a.name.localeCompare(b.name)),
    [categoriesQuery.data],
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initValue?.name || '',
      date: today,
      value: initValue ? Math.abs(initValue.value) : 100,
      categoryId: initValue ? String(initValue.category_id) : '',
      fixed: initValue ? initValue.type === 'fixed' : false,
      type: initValue ? (initValue.value >= 0 ? 'income' : 'expense') : 'expense',
      ignoreFromForecast: initValue ? !initValue.forecast : false,
    },
  })

  const [fixed] = form.watch(['fixed'])
  const errors = form.formState.errors

  async function handleSubmit(data: zod.infer<typeof formSchema>) {
    if (pending) return

    const year = data.date.getFullYear()
    const month = data.date.getMonth()
    const day = data.date.getDate()

    setPending(true)
    onSubmit({
      category_id: Number(data.categoryId),
      day,
      month,
      year,
      name: data.name,
      type: fixed ? 'fixed' : 'one-time',
      value: data.type === 'income' ? data.value : -data.value,
      forecast: data.fixed || !data.ignoreFromForecast,
    }).finally(() => setPending(false))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4 items-start">
      {/* Name */}
      <Field>
        <FieldLabel>Transaction name</FieldLabel>
        <Input placeholder="Transaction name" type="text" {...form.register('name')} />
        <FieldError>{errors.name?.message}</FieldError>
      </Field>
      <div className="flex gap-4 w-full">
        {/* Category */}
        <Field className="flex-2">
          <FieldLabel>Category</FieldLabel>
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field }) => (
              <Combobox
                options={sortedCategories.map((cat) => ({
                  value: String(cat.id),
                  label: cat.name,
                }))}
                onValueChange={field.onChange}
                value={field.value}
              />
            )}
          />
          <FieldError>{errors.categoryId?.message}</FieldError>
        </Field>

        {/* Date */}
        <Field className="flex-3">
          <FieldLabel>Date</FieldLabel>
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="text-left">
                    <CalendarIcon />
                    {formatDate(today, field.value)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                </PopoverContent>
              </Popover>
            )}
          />
        </Field>
      </div>

      <div className="flex gap-4 w-full">
        {/* Fixed */}
        <Field className="max-w-25">
          <FieldLabel>Type</FieldLabel>
          <Controller
            control={form.control}
            name="fixed"
            render={({ field }) => (
              <Button
                variant="outline"
                type="button"
                onClick={() => field.onChange(!field.value)}
                disabled={isEditting}
              >
                {field.value ? <Calendar1 /> : <Asterisk />}
                {field.value ? 'Fixed' : 'Single'}
              </Button>
            )}
          />
        </Field>

        {/* Signal */}
        <Field className="max-w-25">
          <FieldLabel>&nbsp;</FieldLabel>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Button
                variant="outline"
                type="button"
                className={
                  field.value === 'income'
                    ? 'text-green-600 hover:text-green-700'
                    : 'text-red-600 hover:text-red-700'
                }
                onClick={() => field.onChange(field.value === 'income' ? 'expense' : 'income')}
              >
                {field.value === 'income' ? <BanknoteArrowUp /> : <BanknoteArrowDown />}
                {field.value === 'income' ? 'Income' : 'Expense'}
              </Button>
            )}
          />
        </Field>
        {/* Value */}
        <Field className="flex-1">
          <FieldLabel>Value</FieldLabel>
          <Controller
            control={form.control}
            name="value"
            render={({ field }) => (
              <MoneyField
                name={field.name}
                value={field.value}
                onChange={(v) => field.onChange(v)}
                defaultValue={initValue ? Math.abs(initValue.value) : undefined}
              />
            )}
          />

          <FieldError>{errors.value?.message}</FieldError>
        </Field>
      </div>

      {/* Ignore from forecast */}
      <Controller
        control={form.control}
        name="ignoreFromForecast"
        render={({ field }) => (
          <div className="flex gap-2">
            <Checkbox
              id={field.name}
              name={field.name}
              checked={fixed || field.value}
              onCheckedChange={(data) => {
                console.log(data)
                field.onChange(data.valueOf())
              }}
              disabled={fixed}
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor={field.name}>Ignore from forecast</Label>
              <p className="text-sm text-muted-foreground">
                {fixed
                  ? 'Fixed transactions are always included in the forecast calculations.'
                  : field.value
                    ? 'This transaction will be ignored in the forecast calculations.'
                    : 'This transaction will be included in the forecast calculations.'}
              </p>
            </div>
          </div>
        )}
      />

      <FieldError>{errors.value?.message}</FieldError>

      <div className="flex gap-4 self-end">
        <Button variant="secondary" onClick={onClose} type="button" disabled={pending}>
          Cancel
        </Button>
        <Button variant="default" type="submit" disabled={pending}>
          {initValue ? 'Save' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
