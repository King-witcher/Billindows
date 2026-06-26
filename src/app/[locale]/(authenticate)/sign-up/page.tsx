'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Check, Eye, EyeOff, Mail, UserPlus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { errorKey } from './_error'
import { signUpAction } from './action'
import { type SignUpPayload, schema } from './schema'

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

function getPasswordStrength(password: string): { score: number; level: StrengthLevel } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const level: StrengthLevel =
    score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong'

  return { score, level }
}

export default function Page() {
  const t = useTranslations('auth')
  const search = useSearchParams()
  const referrer = search.get('referrer') ?? '/'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const signUpMutation = useMutation({
    mutationKey: ['signUp'],
    mutationFn: signUpAction,
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const password = watch('password') ?? ''
  const passwordConfirmation = watch('passwordConfirmation') ?? ''
  const strength = getPasswordStrength(password)
  const passwordsMatch = password === passwordConfirmation && passwordConfirmation.length > 0

  function onSubmit(data: SignUpPayload) {
    signUpMutation.mutate(data)
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-3 pb-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <UserPlus className="size-7 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl">{t('signupTitle')}</CardTitle>
          <CardDescription className="mt-1.5">{t('signupSubtitle')}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <form id="sign-up-form" className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" name="referrer" value={referrer} />

          <Field>
            <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Mail className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                disabled={signUpMutation.isPending}
                aria-invalid={!!errors.email}
                autoComplete="email"
                {...register('email')}
                required
              />
            </InputGroup>
            <FieldError errors={[errors.email]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder={t('namePlaceholder')}
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
            <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('passwordPlaceholderNew')}
                disabled={signUpMutation.isPending}
                aria-invalid={!!errors.password}
                autoComplete="new-password"
                {...register('password')}
                required
              />
              <InputGroupAddon align="inline-end">
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </InputGroupAddon>
            </InputGroup>
            {password.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in-0 duration-200">
                <Progress
                  value={(strength.score / 5) * 100}
                  className={cn(
                    'h-1.5',
                    strength.level === 'weak' && '*:data-[slot=progress-indicator]:bg-destructive',
                    strength.level === 'fair' && '*:data-[slot=progress-indicator]:bg-orange-400',
                    strength.level === 'good' && '*:data-[slot=progress-indicator]:bg-yellow-400',
                    strength.level === 'strong' && '*:data-[slot=progress-indicator]:bg-income',
                  )}
                />
                <span
                  className={cn(
                    'shrink-0 text-xs font-medium',
                    strength.level === 'weak' && 'text-destructive',
                    strength.level === 'fair' && 'text-orange-500',
                    strength.level === 'good' && 'text-yellow-600',
                    strength.level === 'strong' && 'text-income',
                  )}
                >
                  {t(`strength.${strength.level}`)}
                </span>
              </div>
            )}
            <FieldError errors={[errors.password]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="passwordConfirmation">{t('confirmPassword')}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="passwordConfirmation"
                type={showConfirm ? 'text' : 'password'}
                placeholder={t('confirmPlaceholder')}
                disabled={signUpMutation.isPending}
                aria-invalid={!!errors.passwordConfirmation}
                autoComplete="new-password"
                {...register('passwordConfirmation')}
                required
              />
              <InputGroupAddon align="inline-end">
                {passwordsMatch ? (
                  <Check className="size-4 text-income" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showConfirm ? t('hidePassword') : t('showPassword')}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                )}
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[errors.passwordConfirmation]} />
          </Field>

          {signUpMutation.isError && (
            <div className="rounded-md bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
              {t(`errors.${errorKey(signUpMutation.error.name)}`)}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full"
            disabled={signUpMutation.isPending}
          >
            {signUpMutation.isPending ? (
              <>
                <Spinner />
                {t('creatingAccount')}
              </>
            ) : (
              t('createAccount')
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pt-0">
        <div className="relative w-full">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            {t('or')}
          </span>
        </div>
        <div className="text-center text-sm text-muted-foreground">{t('haveAccount')}</div>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">{t('login')}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
