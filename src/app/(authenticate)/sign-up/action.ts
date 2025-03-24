'use server'

import { createSession } from '@/lib/session'
import { prisma } from '@/services'
import { FormState, FormStateEnum } from '@/types/form-state'
import bcrypt from 'bcrypt'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(4).max(50),
  password: z.string().min(8).max(50),
  passwordConfirmation: z.string().min(8).max(50),
  referrer: z.string(),
})

export async function signUp(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    password: formData.get('password'),
    passwordConfirmation: formData.get('passwordConfirmation'),
    referrer: formData.get('referrer'),
  })

  if (!validatedFields.success) {
    return {
      state: FormStateEnum.Error,
      message: validatedFields.error.message,
    }
  }

  // Check if the password and password confirmation match
  if (
    validatedFields.data.password !== validatedFields.data.passwordConfirmation
  ) {
    return {
      state: FormStateEnum.Error,
      message: 'Password and password confirmation do not match',
    }
  }

  // Check if a user with this email already exists
  {
    const user = await prisma.user.findUnique({
      where: {
        email: validatedFields.data.email,
      },
      select: {
        id: true,
      },
    })

    if (user) {
      return {
        state: FormStateEnum.Error,
        message: 'A user with this email already exists.',
      }
    }
  }

  // Create the user
  const user = await prisma.user.create({
    data: {
      email: validatedFields.data.email,
      name: validatedFields.data.name,
      password_digest: bcrypt.hashSync(validatedFields.data.password, 10),
    },
  })

  await createSession({
    email: user.email,
    id: String(user.id),
    name: user.name,
    role: 'user',
  })

  redirect(validatedFields.data.referrer)
}
