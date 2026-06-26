import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { ColorPicker } from '@/components/atoms/inputs/color-picker'
import { MoneyField } from '@/components/atoms/inputs/money-input'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { sanitizeSpaces } from '@/utils/utils'

const schema = z.object({
  name: z.string().min(1).max(30).transform(sanitizeSpaces),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/), // Hex color validation
  goal: z.int().nullable(), // Negative means expense, positive means income, null means off
})

/** Generates vivid colors thanks to my strong mathematical skills 😉 */
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

export type CategoryFormData = z.infer<typeof schema>

type Props = {
  formId: string
  initData?: CategoryFormData
  onSubmit: (data: CategoryFormData) => void
}

type GoalType = 'expense' | 'income'

export function CategoryForm({ formId, initData, onSubmit }: Props) {
  const defaultColor = useMemo(() => initData?.color ?? getRandomColor(), [initData?.color])

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initData?.name ?? '',
      color: defaultColor,
      goal: initData?.goal ?? null,
    },
  })

  const [goalType, setGoalType] = useState<GoalType>(
    initData?.goal != null && initData.goal > 0 ? 'income' : 'expense',
  )
  const color = form.watch('color')

  const handleColorChange = useCallback(
    (newColor: string) => {
      form.setValue('color', newColor, { shouldValidate: true })
    },
    [form],
  )

  const handleRandomize = useCallback(() => {
    handleColorChange(getRandomColor())
  }, [handleColorChange])

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Name */}
      <Field>
        <FieldLabel htmlFor={`${formId}-name`}>Name</FieldLabel>
        <Input
          id={`${formId}-name`}
          placeholder="e.g. Groceries, Rent, Salary..."
          maxLength={30}
          autoFocus
          {...form.register('name')}
        />
        <FieldError errors={[form.formState.errors.name]} />
      </Field>

      {/* Color */}
      <Field>
        <FieldLabel>Color</FieldLabel>
        <ColorPicker value={color} onChange={handleColorChange} onRandomize={handleRandomize} />
        <FieldError errors={[form.formState.errors.color]} />
      </Field>

      {/* Goal */}
      <Field>
        <FieldLabel>Budget goal</FieldLabel>
        <FieldDescription>
          Set a monthly target to track your spending or income for this category.
        </FieldDescription>

        <Controller
          control={form.control}
          name="goal"
          render={({ field }) => (
            <>
              {/** biome-ignore lint/a11y/noLabelWithoutControl: dumbiome */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <Switch
                  checked={field.value !== null}
                  onCheckedChange={(value) => field.onChange(value ? 0 : null)}
                />
                <span className="text-sm">{field.value !== null ? 'Goal enabled' : 'No goal'}</span>
              </label>
              {field.value !== null && (
                <div className="flex flex-col gap-3 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                  <Tabs
                    value={goalType}
                    onValueChange={(v) => {
                      setGoalType(v as GoalType)
                      if (v === 'income') field.onChange(Math.abs(field.value ?? 0))
                      else field.onChange(-Math.abs(field.value ?? 0))
                    }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="expense" className="flex-1 gap-1.5">
                        <TrendingDown className="size-3.5" />
                        Expense
                      </TabsTrigger>
                      <TabsTrigger value="income" className="flex-1 gap-1.5">
                        <TrendingUp className="size-3.5" />
                        Income
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <MoneyField
                    value={Math.abs(field.value)}
                    onChange={(value) => {
                      if (goalType === 'income') field.onChange(Math.abs(value))
                      else field.onChange(-Math.abs(value))
                    }}
                  />
                </div>
              )}
            </>
          )}
        />
      </Field>
    </form>
  )
}
