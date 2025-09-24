'use client'

import { ActionState, ActionStateEnum } from '@/lib/action-state-management'
import { Button, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { signUp } from './action'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema } from './schema'
import { getErrorMessage } from './_error'

export default function Page() {
  const [state, action, pending] = useActionState(signUp, ActionState.idle())
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, dirtyFields },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const [password, passwordConfirmation] = watch([
    'password',
    'passwordConfirmation',
  ])

  const passwordsMatch =
    password === passwordConfirmation || !dirtyFields.passwordConfirmation

  return (
    <>
      <Typography variant="h4" color="primary">
        Sign up
      </Typography>
      <form
        className="w-full flex flex-col items-center gap-[20px] mt-[20px]"
        onSubmit={handleSubmit(action)}
      >
        <input type="hidden" name="referrer" value={referrer} />
        <TextField
          label="Email"
          type="email"
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={pending}
          required
          {...register('email')}
        />
        <TextField
          label="Name"
          type="name"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          disabled={pending}
          sx={{
            minLength: 4,
            maxLength: 20,
          }}
          required
          {...register('name')}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          disabled={pending}
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          error={!passwordsMatch}
          helperText={!passwordsMatch ? 'Passwords do not match' : undefined}
          disabled={pending}
          required
          {...register('passwordConfirmation')}
        />
        <Button
          className="!mt-[20px]"
          type="submit"
          variant="contained"
          size="large"
          disabled={pending}
          fullWidth
        >
          Continue
        </Button>
        {state.state === ActionStateEnum.Error && (
          <Typography
            color="error"
            fontSize="0.875rem"
            align="center"
            margin={0}
          >
            {getErrorMessage(state.code)}
          </Typography>
        )}
      </form>
      <Typography variant="subtitle1" align="center">
        Already have an account?
      </Typography>
      <Button
        LinkComponent={Link}
        href="/sign-in"
        variant="outlined"
        size="large"
        disabled={pending}
        fullWidth
      >
        Sign in
      </Button>
    </>
  )
}
