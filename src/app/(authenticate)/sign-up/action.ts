'use server'

import bcrypt from 'bcrypt'
import type { ZodError } from 'zod'
import { prisma } from '@/database/prisma'
import { ActionError, withActionState } from '@/lib/action-state-management'
import { createSession } from '@/lib/session'
import { sanitize } from '@/utils/utils'
import { SignUpError } from './_error'
import { schema } from './schema'

export const signUp = withActionState(async (data: unknown) => {
  const body = await schema.parseAsync(data).catch((e: ZodError) => {
    console.error(e)
    throw new ActionError(SignUpError.InvalidFormData)
  })

  // Check if the password and password confirmation match
  if (body.password !== body.passwordConfirmation) {
    throw new ActionError(SignUpError.PasswordsDoNotMatch)
  }

  // Check if a user with this email already exists
  {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    })

    if (user) throw new ActionError(SignUpError.EmailAlreadyInUse)
  }

  // Create the user
  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password_digest: bcrypt.hashSync(body.password, 10),
    },
  })

  await createSession({
    email: user.email,
    id: user.id,
    name: sanitize(user.name),
    role: 'user',
  })
})
