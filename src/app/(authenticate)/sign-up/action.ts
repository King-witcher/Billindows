'use server'

import { ActionError, withActionState } from '@/lib/action-state-management'
import { createSession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import { z, ZodError } from 'zod'
import { zfd } from 'zod-form-data'
import { SignUpError } from './_error'

const schema = zfd.formData({
  email: z.string().email().max(320),
  name: z.string().min(4).max(50),
  password: z.string().min(8).max(50),
  passwordConfirmation: z.string().min(8).max(50),
  referrer: zfd.text().default('/'),
})

export const signUp = withActionState(async (formData: FormData) => {
  const body = await schema.parseAsync(formData).catch((e: ZodError) => {
    throw new ActionError(SignUpError.InvalidFormData, e.message)
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
    name: user.name,
    role: 'user',
  })

  redirect(body.referrer)
})
