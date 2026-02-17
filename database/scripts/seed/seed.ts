import bcrypt from 'bcrypt'
import { buildDefaultContainer } from '@/lib/injector/dependencies'

async function createTestUser() {
  const ctx = buildDefaultContainer()
  const email = 'test@test.com'
  const password = ''
  const name = 'Test User'

  const user = await ctx.repositories.users.create({
    email,
    name,
    password_digest: await bcrypt.hashSync(password, 10),
  })

  const category = await ctx.repositories.categories.create({
    color: '#ff00ff',
    goal: null,
    name: 'Programming',
    user_id: user.id,
  })

  await ctx.repositories.transactions.create(user.id, {
    amount: 100,
    category_id: category.id,
    date: {
      day: 1,
      month: 2,
      year: 2024,
    },
    forecast: true,
    name: 'Test Transaction',
    recurrence: 'one-time',
  })
}

async function main() {
  console.log('Creating test user...')
  await createTestUser()
}

main()
