import { Prisma, PrismaClient } from '@prisma/client'
import { range } from 'lodash'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

function createCategory(): Prisma.CategoryCreateWithoutUserInput {
  return {
    name: faker.word.noun(),
    color: faker.color.rgb(),
    goal: faker.number.float({ min: 400, max: 2000 }),
  }
}

function createUser(): Prisma.UserCreateInput {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordDigest: '',
  }
}

async function main() {
  console.log('Seeding users...')
  const users = await prisma.user.createManyAndReturn({
    data: range(20).map(createUser),
  })

  console.log('Seeding categories...')
  for (const user of users) {
    const categories = range(20).map(createCategory)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        categories: {
          create: categories,
        },
      },
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
