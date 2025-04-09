'use server'

import { ActionError, withActionState } from '@/lib/action-state-management'
import { createSession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { zfd } from 'zod-form-data'
import { SignInError } from './_error'

const schema = zfd.formData({
  email: z.string().email().max(320),
  password: z.string().max(50),
  referrer: z.string(),
})

export const signIn = withActionState(async (formData: FormData) => {
  const body = await schema.parseAsync(formData).catch(() => {
    throw new ActionError(SignInError.InvalidFormData)
  })

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  })

  if (!user) {
    // Pretend some validation time
    await bcrypt.compare(body.password, `$2b$10$${'0'.repeat(60)}`)
    throw new ActionError(SignInError.InvalidCredentials)
  }

  if (!(await bcrypt.compare(body.password, user.password_digest)))
    throw new ActionError(SignInError.InvalidCredentials)

  await createSession({
    email: user.email,
    id: user.id,
    name: user.name,
    role: 'user',
  })

  redirect(body.referrer)
})
