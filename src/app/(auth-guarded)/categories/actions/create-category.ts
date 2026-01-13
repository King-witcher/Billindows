'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { parseFormData, sanitize } from '@/utils/utils'

const schema = z.object({
  name: z.string().nonempty().max(30),
  goal: z.coerce.number().int().gt(0).optional(),
  goalType: z.enum(['income', 'expense', 'off']),
  color: z.string(),
})

export async function createCategory(formData: FormData) {
  const session = await verifySession()
  if (!session) return

  const parseData = schema.safeParse(parseFormData(formData))

  if (!parseData.success) {
    console.error(parseData.error)
    return
  }

  const body = parseData.data

  await prisma.category.create({
    data: {
      color: body.color,
      name: sanitize(body.name),
      goal: body.goal ? (body.goalType === 'expense' ? -body.goal : body.goal) : undefined,
      user_id: session.id,
    },
  })
}
