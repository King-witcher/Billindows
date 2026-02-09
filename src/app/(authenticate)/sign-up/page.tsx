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
import { signUpAction } from './action'
import { type SignUpPayload, schema } from './schema'

export default function Page() {
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'

  const signUpMutation = useMutation({
    mutationKey: ['signUp'],
    mutationFn: signUpAction,
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

  function onSubmit(data: SignUpPayload) {
    signUpMutation.mutate(data)
  }

  return (
    <>
      <h1 className="text-3xl font-semibold text-primary">Sign up</h1>
      <form className="w-full flex flex-col gap-5 mt-5" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="referrer" value={referrer} />
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            disabled={signUpMutation.isPending}
            aria-invalid={!!errors.email}
            autoComplete="email"
            {...register('email')}
            required
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            type="text"
            disabled={signUpMutation.isPending}
            aria-invalid={!!errors.name}
            autoComplete="name"
            minLength={4}
            maxLength={20}
            {...register('name')}
            required
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            disabled={signUpMutation.isPending}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            {...register('password')}
            required
          />
          <FieldError errors={[errors.password]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="passwordConfirmation">Confirm Password</FieldLabel>
          <Input
            id="passwordConfirmation"
            type="password"
            disabled={signUpMutation.isPending}
            aria-invalid={!!errors.passwordConfirmation}
            autoComplete="new-password"
            {...register('passwordConfirmation')}
            required
          />
          <FieldError errors={[errors.passwordConfirmation]} />
        </Field>
        <Button className="mt-2" type="submit" size="lg" disabled={signUpMutation.isPending}>
          Continue
        </Button>
        {signUpMutation.isError && (
          <p className="text-destructive text-sm text-center">
            {getErrorMessage(signUpMutation.error.name)}
          </p>
        )}
      </form>
      <p className="text-sm text-muted-foreground text-center">Already have an account?</p>
      <Button
        asChild
        variant="outline"
        size="lg"
        disabled={signUpMutation.isPending}
        className="w-full"
      >
        <Link href="/sign-in">Sign in</Link>
      </Button>
    </>
  )
}
