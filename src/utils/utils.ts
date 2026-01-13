export async function delay(amount: number): Promise<void> {
  return new Promise((res) => setTimeout(res, amount))
}

export function formatMoney(cents: number): string {
  return `${cents < 0 ? '-' : ''} R$ ${Math.abs(cents / 100).toFixed(2)}`
}

export function parseFormData(formData: FormData): Record<string, string> {
  const record: Record<string, string> = {}
  for (const [field, value] of formData) {
    record[field] = value.toString()
  }
  return record
}

export function sanitize(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}

export function sanitizeColor(hex: string) {
  if (!hex.match(/^#([0-9A-Fa-f]{6})$/)) return '#000000'
  return hex
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\-_]/g, '')
}
