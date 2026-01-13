'use server'

import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { ActionError, withActionState } from '@/lib/action-state-management'
import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { DBTime } from '@/utils/time'
import { sanitize } from '@/utils/utils'
import { CreateTxError } from './_errors'

const createTxSchema = zfd.formData({
  id: zfd.numeric(z.number().min(1)),
  name: z.string().nonempty().max(50),
  category: z.coerce.number().int(),
  type: z.enum(['expense', 'income']),
  value: z.coerce.number().gt(0).int(),
  year: z.coerce.number().min(0).int(),
  month: z.coerce.number().min(0).max(11).int(),
  day: z.coerce.number().min(0).int(),
  fixed: zfd.checkbox(),
  forecast: zfd.checkbox(),
})

export const udpateTxAction = withActionState(async (formData: FormData) => {
  const session = await verifySession()
  if (!session) throw new ActionError(CreateTxError.Unauthorized)

  const body = await createTxSchema.parseAsync(formData).catch((e) => {
    console.error('Failed to validate form data')
    console.error('formData', formData)
    console.error('error', e)
    throw new ActionError(CreateTxError.InvalidFormData)
  })

  const category = await prisma.category.findUnique({
    where: {
      id: body.category,
    },
  })

  if (!category || category.user_id !== session.id)
    throw new ActionError(CreateTxError.CategoryNotFound)

  if (body.fixed)
    await prisma.$executeRaw`
      UPDATE fixed_txs ft
      SET
        name = ${sanitize(body.name)},
        value = ${body.type === 'expense' ? -body.value : body.value},
        start_month = ${DBTime.fromYMToDB(body.year, body.month)},
        day = ${body.day},
        category_id = ${body.category}
      FROM categories c
      WHERE (
        ft.category_id = c.id
        AND c.user_id = ${session.id}
        AND ft.id = ${body.id}
      )
    `
  else
    await prisma.$executeRaw`
      UPDATE one_time_txs ott
      SET
        name = ${sanitize(body.name)},
        value = ${body.type === 'expense' ? -body.value : body.value},
        month = ${DBTime.fromYMToDB(body.year, body.month)},
        day = ${body.day},
        forecast = ${body.forecast},
        category_id = ${body.category}
      FROM categories c
      WHERE (
        ott.category_id = c.id
        AND c.user_id = ${session.id}
        AND ott.id = ${body.id}
      )
    `
})
