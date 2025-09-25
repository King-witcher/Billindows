import { sanitizeColor } from '@/utils/utils'

interface Props {
  name: string
  color: string
}

function getRGBComponents(hex: string) {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function getLuma(hex: string) {
  const { r, g, b } = getRGBComponents(hex)
  return Math.floor((0.2126 * r + 0.7152 * g + 0.0722 * b) / 2.55) / 100
}

let index = 0

export function TransactionBadge({ name, color }: Props) {
  const sanitized = sanitizeColor(color)
  index++
  const luma = getLuma(sanitized)
  const darken = luma > 0.5 ? Math.floor(50 * luma ** 2) : 0

  const textColor = `color-mix(in hsl, ${sanitized} ${100 - darken}%, #000 ${darken}%)`

  return (
    <div
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        border: `1px solid ${textColor}`,
        backgroundColor: `${sanitized}30`,
        color: textColor,
      }}
    >
      {name}
    </div>
  )
}
