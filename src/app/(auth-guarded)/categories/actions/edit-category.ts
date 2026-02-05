'use server'

import { z } from 'zod'
import { prisma } from '@/database/prisma'
import { verifySession } from '@/lib/session'
import { parseFormData, sanitize } from '@/utils/utils'

const schema = z.object({
  id: z.coerce.number().gt(0),
  name: z.string().nonempty().max(30),
  goal: z.coerce.number().int().gt(0).optional(),
  goalType: z.enum(['income', 'expense', 'off']),
  color: z.string(),
})

export async function editCategory(formData: FormData) {
  const session = await verifySession()
  if (!session) return

  const parseData = schema.safeParse(parseFormData(formData))

  if (!parseData.success) {
    console.error(parseData.error)
    return
  }

  const body = parseData.data

  await prisma.$executeRaw`
    UPDATE categories
    SET
      name = ${sanitize(body.name)},
      color = ${body.color},
      goal = ${
        body.goal !== undefined ? (body.goalType === 'expense' ? -body.goal : body.goal) : null
      }
    WHERE id = ${body.id}
    AND user_id = ${session.id}
  `
}
