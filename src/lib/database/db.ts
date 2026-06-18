import {
  type PoolClient as PgClient,
  Pool as PgPool,
  type QueryConfig,
  type QueryConfigValues,
} from 'pg'

export interface IDBClient {
  query<T>(text: string, values?: unknown[]): Promise<T[]>
  query<T>(params: { text: string; values: unknown[] }): Promise<T[]>

  sql<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]>
}

export class DbPool implements IDBClient {
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

  query<T>(text: string, values?: unknown[]): Promise<T[]>
  query<T>(params: { text: string; values: unknown[] }): Promise<T[]>
  async query<T>(
    textOrParams: string | { text: string; values: unknown[] },
    values?: unknown[],
  ): Promise<T[]> {
    using client = await this.getClient()
    if (typeof textOrParams === 'string') {
      return client.query<T>(textOrParams, values)
    } else {
      return client.query<T>(textOrParams.text, textOrParams.values)
    }
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

export class DbClient implements IDBClient, Disposable {
  constructor(private readonly client: PgClient) {}

  query<T>(text: string, values?: unknown[]): Promise<T[]>
  query<T>(params: { text: string; values: unknown[] }): Promise<T[]>
  async query<T, I>(
    queryTextOrConfig: string | QueryConfig<I>,
    values?: QueryConfigValues<I>,
  ): Promise<T[]> {
    return this.client.query(queryTextOrConfig, values).then((result) => result.rows)
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
