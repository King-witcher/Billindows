import { Pool, type PoolClient } from 'pg'

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})

export function query(text: string, params?: unknown[]) {
  return pool.query(text, params)
}

export async function sql<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
  let text = ''
  for (let i = 0; i < values.length; i++) {
    text += `${strings.raw[i]}$${i + 1}`
  }
  text += strings.raw[values.length]
  const result = await query(text, values)
  return result.rows as T[]
}

export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export function close() {
  return pool.end()
}
