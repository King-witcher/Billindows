'use client'

import { ActionState, ActionStateEnum } from '@/lib/action-state-management'
import { Button, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { signUp } from './action'

export default function Page() {
  const [state, action, pending] = useActionState(signUp, ActionState.idle())
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  return (
    <>
      <Typography variant="h4" color="primary">
        Sign up
      </Typography>
      <form
        className="w-full flex flex-col items-center gap-[20px] mt-[20px]"
        action={action}
      >
        <input type="hidden" name="referrer" value={referrer} />
        <TextField
          label="Email"
          type="email"
          name="email"
          fullWidth
          error={state.state === ActionStateEnum.Error}
          disabled={pending}
          required
        />
        <TextField
          label="Name"
          type="name"
          name="name"
          fullWidth
          error={state.state === ActionStateEnum.Error}
          disabled={pending}
          required
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          fullWidth
          error={state.state === ActionStateEnum.Error}
          disabled={pending}
          required
        />
        <TextField
          label="Password confirmation"
          type="password"
          name="passwordConfirmation"
          fullWidth
          error={state.state === ActionStateEnum.Error}
          helperText={
            state.state === ActionStateEnum.Error ? state.message : undefined
          }
          disabled={pending}
          required
        />
        <input type="hidden" name="referrer" value={referrer} />
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
