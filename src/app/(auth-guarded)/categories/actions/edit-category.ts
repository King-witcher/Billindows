'use server'

import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { parseFormData } from '@/utils/utils'
import { z } from 'zod'

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
      name = ${body.name},
      color = ${body.color},
      goal = ${
        body.goal !== undefined
          ? body.goalType === 'expense'
            ? -body.goal
            : body.goal
          : null
      }
    WHERE id = ${body.id}
    AND user_id = ${session.id}
  `
}
