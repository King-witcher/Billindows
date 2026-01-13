import type { FixedTx, OneTimeTx } from '@prisma/client'
import { hashSync } from 'bcrypt'
import { DBTime } from '@/utils/time'
import { prisma } from './prisma'

const categoryNames = [
  'Mercado',
  'Transporte',
  'Lazer',
  'Contas',
  'Saúde',
  'Educação',
  'Restaurantes',
  'Compras',
  'Viagens',
  'Investimentos',
]

export async function createTestUser() {
  const testUser = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test Account',
      password_digest: await hashSync('1234', 10),
    },
  })

  const [
    mercado,
    transporte,
    lazer,
    contas,
    saude,
    educacao,
    restaurantes,
    compras,
    viagens,
    investimentos,
  ] = await Promise.all(
    categoryNames.map((category) =>
      prisma.category.create({
        data: {
          name: category,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
          goal: 0,
          user_id: testUser.id,
        },
      }),
    ),
  )

  createFixed(investimentos.id, {
    day: 5,
    start_month: DBTime.fromDateToDB(new Date()),
    name: 'Salário',
    value: 2000000,
    end_month: null,
  })

  createFixed(contas.id, {
    day: 7,
    start_month: DBTime.fromDateToDB(new Date()),
    name: 'Aluguel',
    value: 150000,
    end_month: null,
  })

  createFixed(contas.id, {
    day: 15,
    start_month: DBTime.fromDateToDB(new Date()),
    name: 'Internet',
    value: 10000,
    end_month: null,
  })

  createOneTime(mercado.id, {
    name: 'Compra no supermercado',
    value: -20000,
    month: DBTime.fromDateToDB(new Date()),
    day: 3,
    forecast: true,
  })

  createOneTime(transporte.id, {
    name: 'Combustível',
    value: -15000,
    month: DBTime.fromDateToDB(new Date()),
    day: 5,
    forecast: true,
  })

  createOneTime(transporte.id, {
    name: 'Combustível',
    value: -10000,
    month: DBTime.fromDateToDB(new Date()),
    day: 15,
    forecast: true,
  })

  createOneTime(mercado.id, {
    name: 'Compra no supermercado',
    value: -19837,
    month: DBTime.fromDateToDB(new Date()),
    day: 8,
    forecast: true,
  })

  createOneTime(saude.id, {
    name: 'Imprevisto',
    value: -5000,
    month: DBTime.fromDateToDB(new Date()),
    day: 10,
    forecast: false,
  })
}

async function createOneTime(categoryId: number, tx: Omit<OneTimeTx, 'id' | 'category_id'>) {
  prisma.oneTimeTx.create({
    data: {
      ...tx,
      category_id: categoryId,
    },
  })
}

async function createFixed(categoryId: number, tx: Omit<FixedTx, 'id' | 'category_id'>) {
  prisma.fixedTx.create({
    data: {
      ...tx,
      category_id: categoryId,
    },
  })
}
