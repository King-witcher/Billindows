'use server'

import { prisma } from '@/services'
import { FormState } from '@/types/form-state'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import { createSession } from '@/lib/session'
import { redirect } from 'next/navigation'

const schema = z.object({
  email: z.string().email(),
  password: z.string().max(50),
  referrer: z.string(),
})

export async function signIn(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    referrer: formData.get('referrer'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return FormState.error(validatedFields.error.message)
  }

  const user = await prisma.user.findUnique({
    where: {
      email: validatedFields.data.email,
    },
  })

  if (!user) {
    // Fake some validation time
    await bcrypt.compare(validatedFields.data.password, '')
    return FormState.error('invalid credentials')
  }

  if (
    !(await bcrypt.compare(validatedFields.data.password, user.passwordDigest))
  )
    return FormState.error('invalid credentials')

  await createSession({
    email: user.email,
    id: String(user.id),
    name: user.name,
    role: 'user',
  })

  redirect(validatedFields.data.referrer)
}
