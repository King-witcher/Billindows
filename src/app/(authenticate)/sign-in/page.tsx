'use client'

import { Button, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { signIn } from './action'
import { ActionState, ActionStateEnum } from '@/lib/action-state-management'

export default function Page() {
  const [state, action, pending] = useActionState(signIn, ActionState.idle())
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  return (
    <>
      <Typography variant="h4" color="primary">
        Sign in
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
          label="Password"
          type="password"
          name="password"
          disabled={pending}
          error={state.state === ActionStateEnum.Error}
          helperText={
            state.state === ActionStateEnum.Error ? state.message : undefined
          }
          fullWidth
          required
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
