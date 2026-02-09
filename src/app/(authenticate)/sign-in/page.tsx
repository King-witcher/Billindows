'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextField, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from './_error'
import { signInAction } from './action'
import { type SignInPayload, schema } from './schema'

export default function Page() {
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  const signInMutation = useMutation({
    mutationKey: ['signIn'],
    mutationFn: signInAction,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  function onSubmit(data: SignInPayload) {
    signInMutation.mutate(data)
  }

  return (
    <>
      <Typography variant="h4" color="primary">
        Sign in
      </Typography>
      <form
        className="w-full flex flex-col items-center gap-[20px] mt-[20px]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input type="hidden" name="referrer" value={referrer} />
        <TextField
          label="Email"
          type="email"
          fullWidth
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={signInMutation.isPending}
          {...register('email')}
          required
        />
        <TextField
          label="Password"
          type="password"
          disabled={signInMutation.isPending}
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
          disabled={signInMutation.isPending}
          fullWidth
        >
          Continue
        </Button>
        {signInMutation.isError && (
          <Typography color="error" fontSize="0.875rem" align="center" margin={0}>
            {getErrorMessage(signInMutation.error.name)}
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
        disabled={signInMutation.isPending}
        fullWidth
      >
        Create account
      </Button>
    </>
  )
}
