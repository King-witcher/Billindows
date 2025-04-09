import { createTxAction } from './create-transaction'
import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { createTx } from '@/utils/queries/create-tx'

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

function createFormData(obj: Record<string, string>): FormData {
  const formData = new FormData()
  for (const key in obj) {
    formData.append(key, obj[key])
  }
  return formData
}

const baseFormObject = {
  name: 'Test Transaction',
  category: '1',
  type: 'expense',
  value: '100',
  year: '2023',
  month: '5',
  day: '15',
}

describe(createTxAction, () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should fail if session is not verified', async () => {
    vi.mocked(verifySession).mockResolvedValue(null)
    const formData = createFormData(baseFormObject)
    await createTxAction(formData)

    expect(verifySession).toHaveBeenCalled()
    expect(createTx).not.toHaveBeenCalled()
  })

  it('should fail if category does not belong to user', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      id: 1,
      name: 'User 1',
      email: 'a@a.c',
      role: 'user',
    })
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      id: 1,
      user_id: 2,
      name: 'Test Category',
      color: '#000000',
      goal: 0,
    })

    const formData = createFormData({ ...baseFormObject, id: '2' })
    await createTxAction(formData)

    expect(prisma.category.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    })
    expect(createTx).not.toHaveBeenCalled()
  })

  it('should fail if category does not exist', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      id: 1,
      name: 'User 1',
      email: 'a@a.c',
      role: 'user',
    })
    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const formData = createFormData(baseFormObject)
    await createTxAction(formData)
    expect(createTx).not.toHaveBeenCalled()
  })

  it('should create the transaction if everything is fine', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      id: 1,
      name: 'User 1',
      email: 'a@a.c',
      role: 'user',
    })
    vi.mocked(prisma.category.findUnique).mockResolvedValue({
      id: 1,
      user_id: 1,
      name: 'Test Category',
      color: '#000000',
      goal: 0,
    })

    await createTxAction(createFormData(baseFormObject))

    expect(createTx).toHaveBeenCalledWith(1, {
      year: Number(baseFormObject.year),
      month: Number(baseFormObject.month),
      day: Number(baseFormObject.day),
      name: baseFormObject.name,
      type: 'one-time',
      value: -Number(baseFormObject.value),
    })
  })
})
