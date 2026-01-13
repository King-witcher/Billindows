import { faker } from '@faker-js/faker'
import type { Category } from '@prisma/client'
import { ActionState, ActionStateEnum } from '@/lib/action-state-management'
import { type JWTPaylaod, verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { createTx } from '@/utils/queries/create-tx'
import { CreateTxError } from './_errors'
import { createTxAction } from './create-tx'

vi.mock('@/lib/session', () => ({
  verifySession: vi.fn(),
}))

vi.mock('@/services/prisma', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/utils/queries/create-tx', () => ({
  createTx: vi.fn(),
}))

function getBaseFormData(): FormData {
  const formData = new FormData()
  formData.set('name', faker.lorem.words(2))
  formData.set('category', faker.number.int().toString())
  formData.set('type', 'expense')
  formData.set('value', faker.number.int().toString())
  formData.set('year', faker.number.int().toString())
  formData.set('month', faker.number.int({ min: 0, max: 11 }).toString())
  formData.set('day', faker.number.int({ min: 0, max: 31 }).toString())
  formData.set('fixed', 'on')
  formData.set('forecast', 'on')
  return formData
}

function getBaseSession(): JWTPaylaod {
  return {
    id: faker.number.int(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'user',
  }
}

function getBaseCategory(): Category {
  return {
    id: faker.number.int(),
    user_id: faker.number.int(),
    name: faker.lorem.words(2),
    color: faker.color.rgb(),
    goal: faker.number.int(),
  }
}

const idleState = ActionState.idle()

describe(createTxAction, () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should fail if session is not verified', async () => {
    vi.mocked(verifySession).mockResolvedValue(null)

    const formData = getBaseFormData()
    const state = await createTxAction(idleState, formData)

    expect(verifySession).toHaveBeenCalled()
    expect(createTx).not.toHaveBeenCalled()
    expect(state.state).toBe(ActionStateEnum.Error)
    expect(state.code).toBe(CreateTxError.Unauthorized)
  })

  it('should fail if form data is invalid', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      ...getBaseSession(),
      id: 1,
    })

    const formData = getBaseFormData()
    formData.set('category', 'invalid')
    const state = await createTxAction(idleState, formData)

    expect(createTx).not.toHaveBeenCalled()
    expect(state.state).toBe(ActionStateEnum.Error)
    expect(state.code).toBe(CreateTxError.InvalidFormData)
  })

  it('should fail if category does not exist', async () => {
    vi.mocked(verifySession).mockResolvedValue(getBaseSession())
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const formData = getBaseFormData()
    const result = await createTxAction(idleState, formData)

    expect(createTx).not.toHaveBeenCalled()
    expect(result.state).toBe(ActionStateEnum.Error)
    expect(result.code).toBe(CreateTxError.CategoryNotFound)
  })

  it('should fail if category does not belong to user', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      ...getBaseSession(),
      id: 1,
    })
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      ...getBaseCategory(),
      user_id: 2,
    })

    const formData = getBaseFormData()
    const result = await createTxAction(idleState, formData)

    expect(createTx).not.toHaveBeenCalled()
    expect(result.state).toBe(ActionStateEnum.Error)
    expect(result.code).toBe(CreateTxError.CategoryNotFound)
  })

  it('should create the transaction', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      ...getBaseSession(),
      id: 1,
    })
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      ...getBaseCategory(),
      user_id: 1,
    })

    const catId = faker.number.int()
    const formData = getBaseFormData()
    formData.set('category', catId.toString())
    const result = await createTxAction(idleState, formData)

    expect(result.state).toBe(ActionStateEnum.Success)
    expect(createTx).toHaveBeenCalledWith({
      category_id: catId,
      year: Number(formData.get('year')),
      month: Number(formData.get('month')),
      day: Number(formData.get('day')),
      forecast: formData.get('forecast') === 'on',
      name: formData.get('name'),
      type: formData.get('fixed') === 'on' ? 'fixed' : 'one-time',
      value:
        formData.get('type') === 'expense'
          ? -Number(formData.get('value'))
          : Number(formData.get('value')),
    })
  })
})
