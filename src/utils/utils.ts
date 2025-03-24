export async function delay(amount: number): Promise<void> {
  return new Promise((res) => setTimeout(res, amount))
}
