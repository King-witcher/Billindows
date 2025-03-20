'use client'

import { InputGroup } from '@/components/atoms/input-group/input-group'
import { signUp } from './action'
import { FormState, FormStateEnum } from '@/types/form-state'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'

export default function Page() {
  const [state, action, pending] = useActionState(signUp, FormState.idle())
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  return (
    <div className="flex flex-col items-center gap-[20px] w-[300px]">
      <h1 className="text-3xl">Sign up</h1>
      <span className="text-sm">
        Already have an account?{' '}
        <Link
          className="text-emerald-600 hover:text-emerald-800"
          href="/sign-in"
        >
          Sign in
        </Link>
      </span>
      <form
        className="w-full flex flex-col items-center gap-[20px]"
        action={action}
      >
        <input type="hidden" name="referrer" value={referrer} />
        <InputGroup placeholder="Email" type="email" name="email" required />
        <InputGroup placeholder="Name" type="text" name="name" required />
        <InputGroup
          placeholder="Password"
          type="password"
          name="password"
          required
        />
        <InputGroup
          placeholder="Password confirmation"
          type="password"
          name="passwordConfirmation"
          required
        />
        <input type="hidden" name="referrer" value={referrer} />
        <button
          className="h-[50px] w-full rounded-[4px] bg-emerald-600 text-white mt-[20px]"
          type="submit"
        >
          Continue
        </button>
        {state.state === FormStateEnum.Error && (
          <p className="text-red-500 w-full text-center leading-4 text-xs font-mono">
            {state.message}
          </p>
        )}
      </form>
    </div>
  )
}
