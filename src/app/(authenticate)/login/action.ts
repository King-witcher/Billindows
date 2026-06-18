'use server'

import bcrypt from 'bcrypt'
import { action, ClientError } from '@/lib/server-wrappers'
import { SignInError } from './_error'
import { schema } from './schema'

class SignInException extends ClientError<SignInError> {}

export const signInAction = action(schema, async (data, ctx) => {
  const user = await ctx.repositories.users.findByEmail(data.email)
  if (!user) {
    // Perform a dummy bcrypt comparison to mitigate timing attacks for non-existent users
    await bcrypt.compare(data.password, `$2b$10$${'0'.repeat(60)}`)
    throw new SignInException(SignInError.InvalidCredentials)
  }

  if (!(await bcrypt.compare(data.password, user.password_digest)))
    throw new SignInException(SignInError.InvalidCredentials)

  await ctx.authService.createSession({
    email: user.email,
    id: user.id,
    role: 'user',
    name: user.name,
  })
})
