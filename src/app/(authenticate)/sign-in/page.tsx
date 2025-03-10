'use client'

import { FormState, FormStateEnum } from '@/types/form-state'
import { signIn } from './action'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const [state, action, pending] = useActionState(signIn, FormState.idle())
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  console.log(referrer)

  return (
    <main className="h-dvh w-dvw flex items-center justify-center">
      <style jsx>
        {`
          input {
            border: 1px solid #000;
          }
        `}
      </style>
      <form
        action={action}
        className="flex flex-col bg-gray-200 text-black p-[20px] rounded-[10px] gap-[10px]"
      >
        <input type="hidden" name="referrer" value={referrer} />
        <label htmlFor="email">Email</label>
        <input placeholder="email" type="email" name="email" />
        <label htmlFor="password">Password</label>
        <input placeholder="password" type="password" name="password" />
        <button type="submit">{pending ? 'Signing in...' : 'Sign in'}</button>
        {state.state === FormStateEnum.Error && (
          <p className="text-red-500">{state.message}</p>
        )}
      </form>
    </main>
  )
}
