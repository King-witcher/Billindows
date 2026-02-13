import { readdir, readFile } from 'node:fs/promises'
import { close, sql, transaction } from './db'

const MIGRATIONS_DIR = 'database/migrations'

type Migration = {
  name: string
  sql: string
}

/** Lists all migration files in the migrations directory */
async function listFsMigrations(): Promise<Migration[]> {
  const names = await readdir(MIGRATIONS_DIR)

  const sorted = names.sort((a, b) => a.localeCompare(b))
  try {
    const migrations = await Promise.all(
      sorted.map(async (name) => {
        const up = await readFile(`${MIGRATIONS_DIR}/${name}/up.sql`, 'utf-8')
        return {
          name,
          sql: up,
        }
      }),
    )
    return migrations
  } catch (error) {
    console.error('Failed to read migration files.')
    throw error
  }
}

/** Creates the migrations table if it doesn't exist */
async function ensureMigrationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      rolled_back_at TIMESTAMPTZ
    );
  `
}

/** Lists all applied migrations */
async function listAppliedMigrations() {
  const rows = await sql<{ name: string }>`
    SELECT DISTINCT name
    FROM _migrations
    WHERE rolled_back_at IS NULL
  `
  return rows.map((row) => row.name)
}

/** Runs a set of migrations */
async function apply(migrations: Migration[]) {
  await transaction(async (client) => {
    for (const migration of migrations) {
      console.log(`Applying migration: ${migration.name}`)
      try {
        await client.query(migration.sql)
      } catch (error) {
        console.error(`Failed to apply migration: ${migration.name}`)
        console.error('Rolling back all migrations...')
        throw error
      }
      await client.query(
        `
          INSERT INTO _migrations (name)
          VALUES ($1)
        `,
        [migration.name],
      )
    }
  })
}

async function main() {
  try {
    const [migrations, applied] = await Promise.all([
      listFsMigrations(),
      ensureMigrationsTable().then(listAppliedMigrations),
    ])

    const appliedSet = new Set(applied)
    const pending = migrations.filter((migration) => !appliedSet.has(migration.name))

    console.log(`Total migrations found: ${migrations.length}`)
    console.log(`Pending: ${pending.length}`)

    if (pending.length === 0) {
      console.log('No pending migrations. Database is up to date.')
      return
    }

    await apply(pending)
  } catch (error) {
    console.error('Migration process failed:', (error as Error).message)
  } finally {
    close()
  }
}

main()
