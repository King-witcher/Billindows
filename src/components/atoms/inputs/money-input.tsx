import { type ChangeEvent, useCallback, useState } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

type Props = React.ComponentProps<'div'> & {
  /** The value in cents. */
  value?: number
  name?: string

  defaultValue?: number | null
  disabled?: boolean
  required?: boolean
  onChange?: (valueCents: number) => void
}

export function MoneyField(props: Props) {
  const {
    value: controlledValue,
    defaultValue,
    disabled,
    name,
    required,
    onChange,
    ...rest
  } = props
  const [internalValue, setInternalValue] = useState(defaultValue ?? 0)
  const value = controlledValue ?? internalValue
  const controlled = controlledValue !== undefined
  const displayValue = (value / 100).toFixed(2)

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value.replace(/\D/g, ''))
      if (!controlled) setInternalValue(newValue)
      onChange?.(newValue)
    },
    [controlled],
  )

  return (
    <InputGroup {...rest}>
      <input type="hidden" disabled={disabled} name={name} value={value} />
      <InputGroupInput
        onChange={handleChange}
        className="focus:outline-0"
        value={displayValue}
        type="number"
        min={0.01}
        step={0.01}
        required={required}
      />
      <InputGroupAddon>R$</InputGroupAddon>
    </InputGroup>
  )
}
