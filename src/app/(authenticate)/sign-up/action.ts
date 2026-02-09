'use server'

import bcrypt from 'bcrypt'
import { action, ClientError } from '@/lib/server-actions'
import { sanitizeSpaces } from '@/utils/utils'
import { SignUpError } from './_error'
import { schema } from './schema'

class SignUpException extends ClientError<SignUpError> {}

export const signUpAction = action(schema, async (data, ctx) => {
  // TODO: This should be handled by the client
  if (data.password !== data.passwordConfirmation) {
    throw new SignUpException(SignUpError.PasswordsDoNotMatch)
  }

  const user = await ctx.repositories.users.findByEmail(data.email)
  if (user) throw new SignUpException(SignUpError.EmailAlreadyInUse)

  const newUser = await ctx.repositories.users.create({
    email: data.email,
    name: data.name,
    password_digest: bcrypt.hashSync(data.password, 10),
  })

  await ctx.authService.createSession({
    email: newUser.email,
    id: newUser.id,
    name: sanitizeSpaces(newUser.name),
    role: 'user',
  })
})
