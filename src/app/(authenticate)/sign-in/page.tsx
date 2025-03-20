'use client'

import { FormState, FormStateEnum } from '@/types/form-state'
import { signIn } from './action'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { InputGroup } from '@/components/atoms/input-group/input-group'
import Link from 'next/link'

export default function Page() {
  const [state, action, pending] = useActionState(signIn, FormState.idle())
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  return (
    <div className="flex flex-col items-center gap-[20px] w-[300px]">
      <h1 className="text-3xl">Sign in</h1>
      <span className="text-sm">
        Dont have an account yet?{' '}
        <Link
          className="text-emerald-600 hover:text-emerald-800"
          href="/sign-up"
        >
          Create one
        </Link>
      </span>
      <form
        className="w-full flex flex-col items-center gap-[20px]"
        action={action}
      >
        <input type="hidden" name="referrer" value={referrer} />
        <InputGroup placeholder="Email" type="email" name="email" required />
        <InputGroup
          placeholder="Password"
          type="password"
          name="password"
          required
        />
        <button
          className="h-[50px] w-full rounded-[4px] bg-emerald-600 text-white mt-[20px]"
          type="submit"
        >
          Continue
        </button>
      </form>
      {state.state === FormStateEnum.Error && (
        <p className="text-red-500 w-full text-center leading-4 text-xs font-mono">
          {state.message}
        </p>
      )}
    </div>
  )
}
