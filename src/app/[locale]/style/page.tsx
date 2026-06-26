'use client'

import { ArrowDownRight, ArrowUpRight, Plus, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Separator } from '@/components/ui/separator'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const surfaces: { name: string; token: string; fg?: string }[] = [
  { name: 'background', token: '--background' },
  { name: 'card', token: '--card' },
  { name: 'muted', token: '--muted' },
  { name: 'secondary', token: '--secondary' },
  { name: 'accent', token: '--accent' },
  { name: 'border', token: '--border' },
]

const brand: { name: string; token: string; fg: string }[] = [
  { name: 'primary', token: '--primary', fg: '--primary-foreground' },
  { name: 'destructive', token: '--destructive', fg: '--primary-foreground' },
  { name: 'ring', token: '--ring', fg: '--primary-foreground' },
]

const charts = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5']

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted-foreground/80">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function Swatch({ name, token, fg }: { name: string; token: string; fg?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div
        className="flex h-20 items-end p-2"
        style={{ backgroundColor: `var(${token})`, color: fg ? `var(${fg})` : undefined }}
      >
        {fg && <span className="text-xs font-medium opacity-90">Aa</span>}
      </div>
      <div className="px-3 py-2">
        <p className="text-xs font-medium">{name}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{token}</p>
      </div>
    </div>
  )
}

export default function StyleGuidePage() {
  const t = useTranslations('style')

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-15 max-w-5xl items-center gap-3 px-6">
          <Logo />
          <div className="ml-auto flex items-center gap-1">
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-12 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="max-w-prose text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Hero — the product's core insight in the new style */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
          <CardContent className="flex flex-col gap-6 p-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm/none text-primary-foreground/80">
                <Sparkles className="size-4" />
                {t('previewBalance')}
              </div>
              <p className="tnum text-4xl font-semibold tracking-tight">{brl.format(2480)}</p>
              <p className="text-sm text-primary-foreground/80">
                {t('previewSafe')}{' '}
                <span className="tnum font-medium text-primary-foreground">{brl.format(82)}</span>{' '}
                {t('perDay')}
              </p>
            </div>
            <Button variant="secondary" size="lg" className="shrink-0">
              <Plus /> {t('previewBalance')}
            </Button>
          </CardContent>
        </Card>

        {/* Colors */}
        <Section title={t('colors')}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {surfaces.map((s) => (
              <Swatch key={s.token} {...s} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {brand.map((s) => (
              <Swatch key={s.token} {...s} />
            ))}
          </div>
        </Section>

        {/* Semantic finance colors */}
        <Section title={t('semanticColors')}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-sm text-muted-foreground">income</span>
                <span className="tnum flex items-center gap-1 font-medium text-income">
                  <ArrowUpRight className="size-4" />
                  {brl.format(5200)}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-sm text-muted-foreground">expense</span>
                <span className="tnum flex items-center gap-1 font-medium text-expense">
                  <ArrowDownRight className="size-4" />
                  {brl.format(-2720)}
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-sm text-muted-foreground">warning</span>
                <span className="tnum font-medium text-warning">95%</span>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-2">
            {charts.map((c) => (
              <div
                key={c}
                className="h-10 flex-1 rounded-lg"
                style={{ backgroundColor: `var(${c})` }}
                title={c}
              />
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title={t('typography')} description="Geist · numerais tabulares para valores">
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-4xl font-semibold tracking-tight">Display · 36</p>
              <p className="text-2xl font-semibold tracking-tight">Title · 24</p>
              <p className="text-lg font-medium">Heading · 18</p>
              <p className="text-base">
                Body · 16 — Saiba quanto ainda dá pra gastar este mês, com calma.
              </p>
              <p className="text-sm text-muted-foreground">Caption · 14 — texto secundário</p>
              <Separator />
              <p className="tnum text-3xl font-semibold tracking-tight">{brl.format(1234567.89)}</p>
            </CardContent>
          </Card>
        </Section>

        {/* Buttons */}
        <Section title={t('buttons')}>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="add">
              <Plus />
            </Button>
          </div>
        </Section>

        {/* Form + card */}
        <Section title={t('components')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('sampleCard')}</CardTitle>
                <CardDescription>Inputs, labels e botões no novo tema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="demo-name">Nome</Label>
                  <Input id="demo-name" placeholder="Mercado do mês" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="demo-amount">Valor</Label>
                  <Input
                    id="demo-amount"
                    inputMode="decimal"
                    placeholder="R$ 0,00"
                    className="tnum"
                  />
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button className="flex-1">Salvar</Button>
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('radiusAndShadow')}</CardTitle>
                <CardDescription>raio 0.875rem · sombras suaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="size-16 rounded-md border bg-card shadow-xs" />
                  <div className="size-16 rounded-lg border bg-card shadow-sm" />
                  <div className="size-16 rounded-xl border bg-card shadow-md" />
                  <div className="size-16 rounded-2xl border bg-card shadow-lg" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {charts.map((c, i) => (
                    <span
                      key={c}
                      className="rounded-full px-3 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: `var(${c})` }}
                    >
                      Categoria {i + 1}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </main>
    </div>
  )
}
