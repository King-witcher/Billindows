import bcrypt from 'bcrypt'
import { buildDefaultContainer } from '@/lib/injector/dependencies'

async function createTestUser() {
  const ctx = buildDefaultContainer()
  const email = 'test@test.com'
  const password = ''
  const name = 'Test User'

  const _user = await ctx.repositories.users.create({
    email,
    name,
    password_digest: await bcrypt.hashSync(password, 10),
  })
}

async function main() {
  // console.log('Seeding users...')
  // await createUsers(20, true, true)

  console.log('Creating test user...')
  await createTestUser()
}

main()
