import { hashSync } from 'bcrypt'
import { prisma } from './helpers/prisma'
import { createCategories } from './helpers/categories'
import { createUsers } from './helpers/users'

async function main() {
  console.log('Seeding users...')
  await createUsers(10, true, true)

  console.log('Creating test user...')
  const testUser = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test Account',
      password_digest: await hashSync('1234', 10),
    },
  })

  await createCategories(testUser.id, 4, true)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
