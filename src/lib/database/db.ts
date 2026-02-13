import { type PoolClient as PgClient, Pool as PgPool } from 'pg'

export interface IClient {
  query<T>(text: string, values?: unknown[]): Promise<T[]>
  sql<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>
}

export class DbPool implements IClient {
  private pool: PgPool = new PgPool({
    connectionString: process.env.POSTGRES_URL,
  })

  private static _instance: DbPool
  public static get instance(): DbPool {
    if (!DbPool._instance) {
      DbPool._instance = new DbPool()
    }
    return DbPool._instance
  }

  async getClient(): Promise<DbClient> {
    const client = await this.pool.connect()
    return new DbClient(client)
  }

  async query<T>(text: string, values?: unknown[]): Promise<T[]> {
    using client = await this.getClient()
    return client.query<T>(text, values)
  }

  async sql<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
    using client = await this.getClient()
    return client.sql<T>(strings, ...values)
  }

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: This line is meant to fix intellisense after client.query invocation above
  private static fixIntelliSense() {}

  async transaction<T>(fn: (client: DbClient) => Promise<T>): Promise<T> {
    using client = await this.getClient()
    try {
      await client.query('BEGIN')
      const result = await fn(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  }
}

export class DbClient implements IClient, Disposable {
  constructor(private readonly client: PgClient) {}

  async query<T>(text: string, values?: unknown[]): Promise<T[]> {
    return this.client.query(text, values).then((result) => result.rows)
  }

  async sql<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
    let text = ''
    for (let i = 0; i < values.length; i++) text += `${strings.raw[i]}$${i + 1}`
    text += strings.raw[values.length]

    return this.query<T>(text, values)
  }

  [Symbol.dispose]() {
    this.client.release()
  }
}
