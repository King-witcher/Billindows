import { prisma } from '@/services/prisma'
import { DBTime } from '../time'
import { TxDto } from './get-one-time-txs'

/**
 * Gets all fixed transactions in a month.
 * This function also consider transactions from 24h after and before the
 * specified month because of different time zones.
 */
export async function getFixedTxs(
  userId: number,
  year: number,
  month: number
): Promise<TxDto[]> {
  const dbMonthNow = DBTime.fromYMToDB(year, month)

  const now = Date.now()
  const queryResults: {
    id: number
    name: string
    value: number
    start_month: number
    day: number
    category_id: number
    category_color: string
    category_name: string
  }[] = await prisma.$queryRaw`
    WITH c AS (
      SELECT id, color, name
      FROM categories
      WHERE user_id = ${userId}
    )
    
    SELECT
      t.id,
      t.name,
      t.value,
      t.start_month,
      t.day,
      c.id AS category_id,
      c.color AS category_color,
      c.name AS category_name
    FROM c INNER JOIN fixed_txs t
        ON c.id = t.category_id
    WHERE
      t.start_month <= ${dbMonthNow}
      AND (
        t.end_month IS NULL
        OR t.end_month > ${dbMonthNow}
      )
  `
  console.log(
    `Got ${queryResults.length} fixed transactions in ${Date.now() - now}ms.`
  )

  return queryResults.map((result): TxDto => {
    const [year, month] = DBTime.fromDBToYM(result.start_month)
    return {
      category: {
        id: result.category_id,
        color: result.category_color,
        name: result.category_name,
        goal: null,
      },
      year,
      month,
      day: result.day,
      type: 'fixed',
      forecast: false,
      id: result.id,
      name: result.name,
      value: result.value,
    }
  })
}
