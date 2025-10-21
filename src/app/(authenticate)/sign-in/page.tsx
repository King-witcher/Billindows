'use client'

import { ActionState, ActionStateEnum } from '@/lib/action-state-management'
import { Button, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { signIn } from './action'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema } from './schema'
import { getErrorMessage } from './_error'

export default function Page() {
  const [state, action, pending] = useActionState(signIn, ActionState.idle())
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  return (
    <>
      <Typography variant="h4" color="primary">
        Sign in
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
          {...register('email')}
          required
        />
        <TextField
          label="Password"
          type="password"
          disabled={pending}
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register('password')}
          fullWidth
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
        Dont have an account yet?
      </Typography>
      <Button
        LinkComponent={Link}
        href="/sign-up"
        variant="outlined"
        size="large"
        disabled={pending}
        fullWidth
      >
        Create account
      </Button>
    </>
  )
}
