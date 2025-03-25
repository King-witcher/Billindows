import {
  InputAdornment,
  TextField,
  TextFieldProps,
  TextFieldVariants,
} from '@mui/material'
import { ChangeEvent, useCallback, useState } from 'react'

export function MoneyField<Variant extends TextFieldVariants>(
  props: {
    /**
     * The variant to use.
     * @default 'outlined'
     */
    variant?: Variant

    /** The value in cents. */
    value?: number
    onChange?: (valueCents: number) => void
  } & Omit<TextFieldProps, 'variant' | 'value' | 'onChange' | 'slotProps'>
) {
  const { value: controlledValue, onChange, name, ...textFieldProps } = props
  const [internalValue, setInternalValue] = useState(0)
  const value = controlledValue ?? internalValue
  const controlled = controlledValue !== undefined
  const displayValue = (value / 100).toFixed(2)

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value.replace(/\D/g, ''))
      if (!controlled) setInternalValue(newValue)
      onChange?.(newValue)
    },
    [controlled]
  )

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <TextField
        {...textFieldProps}
        onChange={handleChange}
        value={displayValue}
        type="number"
        slotProps={{
          htmlInput: {
            min: 0.01,
            step: 0.01,
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">R$</InputAdornment>
            ),
          },
        }}
      />
    </>
  )
}
