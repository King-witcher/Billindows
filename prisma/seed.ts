import { prisma } from './helpers/prisma'
import { createUsers } from './helpers/users'
import { createTestUser } from './helpers/create-test-user'

async function main() {
  console.log('Seeding users...')
  await createUsers(20, true, true)

  console.log('Creating test user...')
  await createTestUser()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
