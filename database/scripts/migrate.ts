import { close, transaction } from './db'
import {
  ensureMigrationsTable,
  listAllMigrations,
  listAppliedMigrations,
  type Migration,
} from './utils/migrations'

/** Runs a set of migrations */
async function apply(migrations: Migration[]) {
  const now = Date.now()
  await transaction(async (client) => {
    for (const migration of migrations) {
      try {
        const now = Date.now()
        await client.query(migration.sql)
        console.debug(`Applied migration: ${migration.name} in ${Date.now() - now}ms.`)
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
  console.debug(`Applied ${migrations.length} migrations in ${Date.now() - now}ms.`)
}

async function main() {
  try {
    const start = Date.now()

    const [migrations, applied] = await Promise.all([
      listAllMigrations('up'),
      ensureMigrationsTable().then(listAppliedMigrations),
    ])

    const appliedSet = new Set(applied)
    const pending = migrations.filter((migration) => !appliedSet.has(migration.name))

    console.log(`Total migrations found: ${migrations.length}`)
    console.log(`Pending: ${pending.length}`)

    if (pending.length === 0) {
      console.log('✅ No pending migrations. Database is up to date.')
      return
    }

    await apply(pending)

    const end = Date.now()
    console.log(`✅ Successfully applied ${pending.length} migrations in ${end - start}ms.`)
  } catch (error) {
    console.error('❌ Migration process failed:', (error as Error).message)
  } finally {
    close()
  }
}

main()
