import { readdir, readFile } from 'fs/promises'
import { sql } from '../db'

export type Migration = {
  name: string
  sql: string
}

export const MIGRATIONS_DIR = 'database/migrations'

/** Lists all migration names in the migrations directory */
export async function listFsMigrationNames(): Promise<string[]> {
  const now = Date.now()
  const names = await readdir(MIGRATIONS_DIR)
  const result = names.sort((a, b) => a.localeCompare(b))
  console.debug(`📃 Listed ${names.length} migration names in ${Date.now() - now}ms.`)
  return result
}

export async function readMigration(
  name: string,
  type: 'up' | 'down' = 'up',
): Promise<Migration | null> {
  try {
    const now = Date.now()
    const file = await readFile(`${MIGRATIONS_DIR}/${name}/${type}.sql`, 'utf-8')
    console.debug(`Read ${type} migration file for ${name} in ${Date.now() - now}ms.`)
    return {
      name,
      sql: file,
    }
  } catch (_error) {
    const error = _error as NodeJS.ErrnoException
    // File not found
    if (error.code === 'ENOENT') return null

    console.error(`❌ Failed to read ${type} migration file for ${name}.`)
    throw error
  }
}

/**
 * Reads migration files and returns an array of UpMigration objects
 */
export async function readMigrations(
  names: string[],
  type: 'up' | 'down' = 'up',
): Promise<Migration[]> {
  try {
    const now = Date.now()
    const migrations = await Promise.all(
      names.map(async (name) => {
        const migration = await readMigration(name, type)
        if (!migration) throw new Error(`Missing ${type}.sql file for migration: ${name}`)
        return migration
      }),
    )
    console.debug(`📃 Read ${migrations.length} ${type} migration files in ${Date.now() - now}ms.`)
    return migrations
  } catch (error) {
    console.error('❌ Failed to read migration files.')
    throw error
  }
}

/** Lists all migration files in the migrations directory */
export async function listAllMigrations(type: 'up' | 'down' = 'up'): Promise<Migration[]> {
  const names = await listFsMigrationNames()
  return await readMigrations(names, type)
}

/** Creates the migrations table if it doesn't exist */
export async function ensureMigrationsTable() {
  const now = Date.now()
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      rolled_back_at TIMESTAMPTZ
    );
  `
  console.debug(`Ensured migrations table exists in ${Date.now() - now}ms.`)
}

/** Lists all applied migrations */
export async function listAppliedMigrations() {
  const now = Date.now()
  const rows = await sql<{ name: string }>`
    SELECT DISTINCT name
    FROM _migrations
    WHERE rolled_back_at IS NULL
  `
  console.debug(`Listed ${rows.length} applied migrations in ${Date.now() - now}ms.`)
  return rows.map((row) => row.name)
}
