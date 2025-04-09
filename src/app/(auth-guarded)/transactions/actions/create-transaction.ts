'use server'

import { ActionError, withActionState } from '@/lib/action-state-management'
import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { createTx } from '@/utils/queries/create-tx'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { CreateTxError } from './_errors'

const createTxSchema = zfd.formData({
  name: z.string().nonempty().max(50),
  category: z.coerce.number().int(),
  type: z.enum(['expense', 'income']),
  value: z.coerce.number().gt(0).int(),
  year: z.coerce.number().min(0).int(),
  month: z.coerce.number().min(0).max(11).int(),
  day: z.coerce.number().min(0).int(),
  fixed: z.literal('on').optional(),
})

export const createTxAction = withActionState(async (formData: FormData) => {
  const session = await verifySession()
  if (!session) throw new ActionError(CreateTxError.Unauthorized)

  const body = await createTxSchema.parseAsync(formData).catch((e) => {
    console.error(e)
    throw new ActionError(CreateTxError.InvalidFormData)
  })

  const category = await prisma.category.findUnique({
    where: {
      id: body.category,
    },
  })

  if (!category || category.user_id !== session.id)
    throw new ActionError(CreateTxError.CategoryNotFound)

  await createTx(body.category, {
    year: body.year,
    month: body.month,
    day: body.day,
    name: body.name,
    type: body.fixed === 'on' ? 'fixed' : 'one-time',
    value: body.type === 'expense' ? -body.value : body.value,
  })
})
