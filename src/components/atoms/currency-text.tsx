import Typography, { type TypographyProps } from '@mui/material/Typography'
import { formatMoney } from '@/utils/utils'

interface Props extends TypographyProps {
  value: number | null
}

export function CurrencyText({ value, ...props }: Props) {
  return (
    <Typography
      color={value ? (value < 0 ? 'error' : 'success') : 'textSecondary'}
      component="span"
      {...props}
    >
      {value ? formatMoney(value) : '-'}
    </Typography>
  )
}
