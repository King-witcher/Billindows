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
