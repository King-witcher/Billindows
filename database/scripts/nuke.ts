import { exec } from 'node:child_process'
import { rm } from 'node:fs/promises'

async function main() {
  if (process.env.NODE_ENV !== 'development') {
    console.error('This script should only be run in development environment.')
    process.exit(1)
  }
  console.log('Stopping Docker containers...')
  await exec('docker compose down')
  console.log('💣 Database being nuked...')
  await rm(process.env.POSTGRES_DATA, { recursive: true, force: true })
  console.log('💥 Database nuked.')
  process.exit(0)
}

main()
