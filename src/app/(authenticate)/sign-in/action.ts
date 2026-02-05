'use server'

import bcrypt from 'bcrypt'
import { prisma } from '@/database/prisma'
import { ActionError, withActionState } from '@/lib/action-state-management'
import { createSession } from '@/lib/session'
import { SignInError } from './_error'
import { type SignInPayload, schema } from './schema'

export const signIn = withActionState(async (data: SignInPayload) => {
  const body = await schema.parseAsync(data).catch(() => {
    throw new ActionError(SignInError.InvalidFormData)
  })

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  })

  if (!user) {
    // Pretend to validate something to avoid user enumeration
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
})
