export async function delay(amount: number): Promise<void> {
  return new Promise((res) => setTimeout(res, amount))
}

export function formatMoney(cents: number): string {
  return `${cents < 0 ? '-' : ''} R$ ${Math.abs(cents / 100).toFixed(2)}`
}
