import { prisma } from '@/services/prisma'
import { DBTime } from '../time'

export type CategoryDto = {
  id: number
  color: string
  name: string
  goal: number | null
}

export type TxDto = {
  id: number
  name: string
  value: number
  year: number
  month: number
  day: number
  type: 'fixed' | 'one-time'
  forecast: boolean
  category: CategoryDto
}

/**
 * Gets all fixed transactions in a month.
 * This function also consider transactions from 24h after and before the
 * specified month because of different time zones.
 */
export async function getOneTimeTxs(
  userId: number,
  year: number,
  month: number
): Promise<TxDto[]> {
  const dbMonthNow = DBTime.getMonthByYearAndMonth(year, month)

  const now = Date.now()
  const queryResults: {
    id: number
    name: string
    value: number
    day: number
    category_color: string
    forecast: boolean
    category_id: number
    category_name: string
  }[] = await prisma.$queryRaw`
    WITH c AS (
      SELECT id, color, name FROM categories WHERE user_id = ${userId}
    )
    
    SELECT
      t.id,
      t.name,
      t.value,
      t.forecast,
      t.day,
      c.id AS category_id,
      c.color AS category_color,
      c.name AS category_name
    FROM c INNER JOIN one_time_txs t
        ON c.id = t.category_id
    WHERE
      t.month = ${dbMonthNow}
  `
  console.log(
    `Got ${queryResults.length} one-time transactions in ${Date.now() - now}ms.`
  )

  return queryResults.map(
    (result): TxDto => ({
      category: {
        id: result.category_id,
        color: result.category_color,
        name: result.category_name,
        goal: null,
      },
      year,
      month,
      day: result.day,
      id: result.id,
      forecast: result.forecast,
      name: result.name,
      type: 'one-time',
      value: result.value,
    })
  )
}
