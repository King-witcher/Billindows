'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  Calendar1Icon,
  CalendarIcon,
  HelpCircle,
  RepeatIcon,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as zod from 'zod'
import { MoneyField } from '@/components/atoms/inputs/money-input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Combobox } from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToday } from '@/contexts/today-context'
import { useUser } from '@/contexts/user-context'
import type { AbstractTransaction } from '@/lib/database/types/abstract-transaction'
import { listCategoriesAction } from '../actions/list-categories'

export type FormData = {
  type: 'income' | 'expense'
  name: string
  categoryId: string
  value: number
  date: Date
  fixed: boolean
  includeInForecast: boolean
}

type Props = {
  initValue?: AbstractTransaction
  isEditting: boolean
  onSubmit: (data: Omit<AbstractTransaction, 'id' | 'user_id'>) => Promise<void>
  onClose: () => void
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function TxForm({ onClose, onSubmit, initValue, isEditting }: Props) {
  const user = useUser()
  const today = useToday()
  const locale = useLocale()
  const t = useTranslations('transactions.form')
  const tToday = useTranslations('transactions')
  const [pending, setPending] = useState(false)

  const categoriesQuery = useQuery({
    queryKey: ['categories', user.email],
    queryFn: listCategoriesAction,
    initialData: [],
  })

  const sortedCategories = useMemo(
    () => [...categoriesQuery.data].sort((a, b) => a.name.localeCompare(b.name)),
    [categoriesQuery.data],
  )

  const schema = useMemo(
    () =>
      zod.object({
        type: zod.enum(['income', 'expense']),
        name: zod.string().min(1, t('name')).max(64),
        categoryId: zod.string().min(1, t('category')),
        value: zod.int().min(1, 'R$ 0,01'),
        date: zod.date(),
        fixed: zod.boolean(),
        includeInForecast: zod.boolean(),
      }),
    [t],
  )

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initValue?.name || '',
      date: initValue
        ? new Date(initValue.date.year, initValue.date.month - 1, initValue.date.day)
        : today,
      value: initValue ? Math.abs(initValue.amount) : 100,
      categoryId: initValue ? String(initValue.category_id) : '',
      fixed: initValue ? initValue.recurrence === 'fixed' : false,
      type: initValue ? (initValue.amount >= 0 ? 'income' : 'expense') : 'expense',
      includeInForecast: initValue ? initValue.forecast : true,
    },
  })

  const [fixed] = form.watch(['fixed'])
  const errors = form.formState.errors

  function formatDate(date: Date): string {
    if (isSameDay(date, today)) return tToday('today')
    const sameYear = date.getFullYear() === today.getFullYear()
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: sameYear ? undefined : 'numeric',
    }).format(date)
  }

  async function handleSubmit(data: FormData) {
    if (pending) return

    setPending(true)
    onSubmit({
      category_id: data.categoryId,
      date: {
        year: data.date.getFullYear(),
        month: data.date.getMonth() + 1,
        day: data.date.getDate(),
      },
      name: data.name,
      recurrence: data.fixed ? 'fixed' : 'one-time',
      amount: data.type === 'income' ? data.value : -data.value,
      forecast: data.fixed || data.includeInForecast,
    }).finally(() => setPending(false))
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
      {/* Name */}
      <Field>
        <FieldLabel>{t('name')}</FieldLabel>
        <Input placeholder={t('namePlaceholder')} type="text" {...form.register('name')} />
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <div className="flex gap-4">
        {/* Category */}
        <Field className="flex-2">
          <FieldLabel>{t('category')}</FieldLabel>
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
          <FieldLabel>{t('date')}</FieldLabel>
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon />
                    {formatDate(field.value)}
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

      <div className="flex gap-4">
        {/* Value */}
        <Field className="flex-1">
          <FieldLabel>{t('value')}</FieldLabel>
          <Controller
            control={form.control}
            name="value"
            render={({ field }) => (
              <MoneyField name={field.name} value={field.value} onChange={field.onChange} />
            )}
          />
          <FieldError>{errors.value?.message}</FieldError>
        </Field>

        {/* Recurrence */}
        <Field className="max-w-28">
          <FieldLabel>{t('type')}</FieldLabel>
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
                {field.value ? <RepeatIcon /> : <Calendar1Icon />}
                {field.value ? t('fixed') : t('single')}
              </Button>
            )}
          />
        </Field>

        {/* Sign */}
        <Field className="max-w-28">
          <FieldLabel>&nbsp;</FieldLabel>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Button
                variant="outline"
                type="button"
                className={field.value === 'income' ? 'text-income' : 'text-expense'}
                onClick={() => field.onChange(field.value === 'income' ? 'expense' : 'income')}
              >
                {field.value === 'income' ? <BanknoteArrowUp /> : <BanknoteArrowDown />}
                {field.value === 'income' ? t('income') : t('expense')}
              </Button>
            )}
          />
        </Field>
      </div>

      {/* Include in forecast (the product's core, least-obvious concept) */}
      <Controller
        control={form.control}
        name="includeInForecast"
        render={({ field }) => {
          const checked = fixed || field.value
          return (
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Switch
                id="includeInForecast"
                checked={checked}
                disabled={fixed}
                onCheckedChange={field.onChange}
              />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="includeInForecast">{t('includeInForecast')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="size-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-60">
                      {t('includeInForecastHint')}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-sm text-muted-foreground">
                  {fixed
                    ? t('fixedAlwaysForecast')
                    : checked
                      ? t('includeInForecastHint')
                      : t('excludedHint')}
                </p>
              </div>
            </div>
          )
        }}
      />

      <div className="flex gap-3 self-end">
        <Button variant="secondary" onClick={onClose} type="button" disabled={pending}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={pending}>
          {isEditting ? t('save') : t('create')}
        </Button>
      </div>
    </form>
  )
}
