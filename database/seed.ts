import { createTestUser } from './helpers/create-test-user'
import { createUsers } from './helpers/users'

async function main() {
  console.log('Seeding users...')
  await createUsers(20, true, true)

  console.log('Creating test user...')
  await createTestUser()
}

main()
