'use client'

import { signUp } from './action'
import { FormState, FormStateEnum } from '@/types/form-state'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'

export default function Page() {
  const [state, action, pending] = useActionState(signUp, FormState.idle())
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

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
        <input placeholder="email" type="email" name="email" />
        <input placeholder="name" type="text" name="name" />
        <input placeholder="password" type="password" name="password" />
        <input
          placeholder="password confirmation"
          type="password"
          name="passwordConfirmation"
        />
        <input type="hidden" name="referrer" value={referrer} />
        <button type="submit">{pending ? 'Signing up...' : 'Sign up'}</button>
        {state.state === FormStateEnum.Error && (
          <p className="text-red-500">{state.message}</p>
        )}
      </form>
    </main>
  )
}
