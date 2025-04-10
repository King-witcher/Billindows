import { formatMoney } from '@/utils/utils'
import Typography, { TypographyProps } from '@mui/material/Typography'

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
