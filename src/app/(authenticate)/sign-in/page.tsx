'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { getErrorMessage } from './_error'
import { signInAction } from './action'
import { type SignInPayload, schema } from './schema'

export default function Page() {
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'
  const [showPassword, setShowPassword] = useState(false)

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
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-3 pb-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="size-7 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription className="mt-1.5">Sign in to your account to continue</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <form id="sign-in-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" name="referrer" value={referrer} />

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Mail className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={signInMutation.isPending}
                aria-invalid={!!errors.email}
                autoComplete="email"
                {...register('email')}
                required
              />
            </InputGroup>
            <FieldError errors={[errors.email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                disabled={signInMutation.isPending}
                aria-invalid={!!errors.password}
                autoComplete="current-password"
                {...register('password')}
                required
              />
              <InputGroupAddon align="inline-end">
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.password]} />
          </Field>

          {signInMutation.isError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
              {getErrorMessage(signInMutation.error.name)}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={signInMutation.isPending}
          >
            {signInMutation.isPending ? (
              <>
                <Spinner />
                Signing in...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-0">
        <div className="relative w-full">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            or
          </span>
        </div>
        <div className="text-center text-sm text-muted-foreground">Don&apos;t have an account?</div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/sign-up">Create account</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
