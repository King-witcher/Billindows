import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.POSTGRES_URL}`

const adapter = new PrismaPg({ connectionString })

/** @deprecated */
export const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error'],
})
