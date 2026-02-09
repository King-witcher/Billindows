'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
      <h1 className="text-3xl font-semibold text-primary">Sign in</h1>
      <form className="w-full flex flex-col gap-5 mt-5" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="referrer" value={referrer} />
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            disabled={signInMutation.isPending}
            aria-invalid={!!errors.email}
            autoComplete="email"
            {...register('email')}
            required
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            disabled={signInMutation.isPending}
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            {...register('password')}
            required
          />
          <FieldError errors={[errors.password]} />
        </Field>
        <Button className="mt-2" type="submit" size="lg" disabled={signInMutation.isPending}>
          Continue
        </Button>
        {signInMutation.isError && (
          <p className="text-destructive text-sm text-center">
            {getErrorMessage(signInMutation.error.name)}
          </p>
        )}
      </form>
      <p className="text-sm text-muted-foreground text-center">Don't have an account yet?</p>
      <Button
        asChild
        variant="outline"
        size="lg"
        disabled={signInMutation.isPending}
        className="w-full"
      >
        <Link href="/sign-up">Create account</Link>
      </Button>
    </>
  )
}
